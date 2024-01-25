import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { Auth, AuthParams } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { User } from '../user/entities/user.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { AuthRepository } from './auth.repository';
import { UserDto } from '../user/dto/user.dto';
import { UserFileService } from '../files/user-files.service';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Mobile } from '../mobile/mobile.entity';
import { MobileService } from '../mobile/mobile.service';
import { SecureLoginDto } from './dto/secure-login.dto';
import { LoginOtpRequest } from 'src/contract/version1/request/auth/loginOtp.request';
import { NotFoundError } from 'rxjs';
import { OtpResponse } from 'src/contract/version1/response/auth/otp.response';
import { MobileRepository } from '../mobile/mobile.repository';
import { UserRepository } from '../user/user.repository';
import { AddressRepository } from '../address/address.respository';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private mobileService: MobileService,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
    private readonly mobileRepository: MobileRepository,
    private readonly userRepository: UserRepository,
    private readonly addressRepository: AddressRepository,
  ) {}

  /**
   * Sends otp to provided email or mobile and update auth record with otp code
   * @param email
   * @param mobile
   * @returns
   */
  async sendOtp(email?: string, mobile?: MobileDto): Promise<OtpResponse> {
    try {
      let response: { message; code; expiryTime };

      // TODO: replace this with a call to the microservice to handle call to sendgrid and twilio through Kafka or RabbitMQ
      if (mobile && mobile?.phoneNumber)
        response = await this.twilioService.sendSms(mobile.phoneNumber);
      else if (email) response = await this.sendgridService.sendOTPEmail(email);

      // TODO: below is for debugging purposes only, remove when done
      // response = {
      //   code: '123456',
      //   expiryTime: new Date(Date.now() + 60000),
      //   message: 'OTP sent successfully',
      // };

      const authModel: Auth = new Auth();

      Object.assign(authModel, {
        email,
        otpCode: response.code,
        otpExpiry: response.expiryTime,
      });

      if (mobile && mobile.phoneNumber) {
        this.logger.debug(`mobile provided: ${JSON.stringify(mobile)}`);

        const mobileExist: Mobile = await this.mobileService.getMobile(mobile);

        let auth: Auth;

        if (mobileExist && mobileExist.auth) {
          this.logger.debug(
            `mobile exists, updating the auth's otp code for ${mobile.phoneNumber}`,
          );

          auth = mobileExist.auth;
          await this.authRepository.update(auth.id, {
            ...authModel,
          });
        } else {
          this.logger.debug(
            `mobile doesnt exist, creating a new auth and mobile record for ${mobile.phoneNumber}`,
          );

          auth = await this.addAuth(authModel);

          let newMobile = new Mobile();
          Object.assign(newMobile, {
            ...mobile,
            auth,
          });

          newMobile = await this.mobileService.addUserMobile(newMobile, auth);
        }

        authModel.id = auth.id;
      } else {
        this.logger.debug(`email provided: ${email}`);

        let authAcct = await this.authRepository.findOneBy({ email });

        if (authAcct) {
          this.logger.debug('auth account exists, updating otp code');
          await this.authRepository.update(authAcct.id, {
            ...authModel,
          });
        } else {
          this.logger.debug('auth account does not exist, creating one');
          authAcct = await this.addAuth(authModel);
        }

        authModel.id = authAcct.id;
      }

      // generate token with user id
      const token = this.generateJwt(authModel);

      // return response with token
      const otpResponse: OtpResponse = { ...response, token };

      return otpResponse;
    } catch (error) {
      // catch database errors and throw a new error for the controller to handle
      this.logger.error(`From AuthService.sendOtp: ${error.message}`);

      throw new Error(`From AuthService.sendOtp: ${error.message}`);
    }
  }

  async verifyOtp(
    authId: string,
    otp: string,
  ): Promise<{ message: string; status: boolean }> {
    this.logger.debug(`Verifying OTP for authId: ${authId}`);

    const auth = await this.authRepository.findOneBy({ id: authId });

    if (auth == null) throw new Error('Could not find associated account');

    const expiryTime = new Date(auth.otpExpiry).toISOString();

    const currentTime = new Date(Date.now()).toISOString();

    if (currentTime <= expiryTime) {
      const validOtpCode = auth.otpCode == otp;

      if (validOtpCode) {
        // mark account as verified
        await this.authRepository.update(authId, {
          ...auth,
          accountVerified: true,
        });
        return { message: 'OTP successfully verified', status: true };
      } else throw new UnauthorizedException('OTP does not match');
    } else throw new UnauthorizedException('OTP has expired');
  }

  async getAuthByEmail(email: string): Promise<Auth> {
    try {
      const auth = await this.authRepository
        .createQueryBuilder('auth')
        .where('auth.email = :email', { email })
        .leftJoinAndSelect('auth.user', 'user')
        .getOne();

      return auth || null;
    } catch (e) {
      throw new Error(
        `Error from findByEmailOrMobile method in auth.service.ts.
        with error message: ${e.message}`,
      );
    }
  }

  // method to update auth account user id
  async updateAuthUserId(authId: string, user: User): Promise<any> {
    try {
      if (!authId) throw new Error('authId is required');
      if (!user) throw new Error('user is required');

      const auth = await this.authRepository.update(authId, {
        user,
      });
      return auth;
    } catch (e) {
      throw new Error(
        `Error from updateAuthUserId method in auth.service.ts.
        with error message: ${e.message}`,
      );
    }
  }

  // method to update auth account email or mobile
  async updateAuthEmailOrMobile(
    authId: string,
    authDto: CreateAuthDto,
  ): Promise<any> {
    if (!authId) throw new Error('authId is required');
    if (!authDto) throw new Error('authDto is required');
    if (!authDto.email && !authDto.mobile)
      throw new Error('email or mobile is required');
    const auth = await this.authRepository.updateAuth(authId, authDto);
    return auth;
  }

  /**
   *
   * @param loginDto
   * @returns
   */
  async login(loginDto: SecureLoginDto): Promise<any> {
    try {
      this.logger.debug(
        `login endpoint called with body LoginDto: ${JSON.stringify(loginDto)}`,
      );

      // verify if OTP is correct

      if (!loginDto.email && !loginDto.mobile)
        throw new Error('email or mobile is required');

      let authId: string;

      if (loginDto.mobile) {
        const mobileEntity: Mobile = await this.mobileService.getMobile(
          loginDto.mobile,
        );

        if (!mobileEntity) {
          throw new HttpException('User not registered', HttpStatus.NOT_FOUND);
        } else if (!mobileEntity.auth)
          throw new Error('Mobile is not registered to a user');

        authId = mobileEntity.auth.id;
      }

      const input: AuthParams = {
        email: loginDto.email,
        authId,
      };

      // pull all user info from the database
      const authAcct = await this.getAllUserInfo(input);

      if (!authAcct) {
        this.logger.debug('Unable to retrieve auth account: ', authAcct);
        throw new Error('Unable to retrieve auth accoun');
      }

      if (!authAcct.user) {
        this.logger.debug(
          'User has incomplete registeration with user: ',
          authAcct.user,
        );
        throw new Error(
          'User has incomplete registeration, please complete registeration',
        );
      }

      // generate token with userID
      const token = this.generateJwt(authAcct.user);

      // const user: UserDto = mapAuthToUser(authAcct);
      const user: UserDto = new UserDto();
      Object.assign(user, authAcct.user);

      return { token, user };
    } catch (e) {
      throw new Error(`From AuthService.login: ${e}`);
    }
  }

  async loginOtpRequest(body: LoginOtpRequest): Promise<OtpResponse> {
    try {
      const { email, mobile } = body;

      if (!email && !mobile)
        throw new BadRequestException('email or mobile is required');

      if (mobile) {
        const registeredMobile = this.mobileService.getMobile(mobile);

        if (!registeredMobile)
          throw new NotFoundException('Mobile is not registered');
      } else {
        const authExist = await this.authRepository.findByUniq({ email });

        if (!authExist) throw new NotFoundException('Email is not registered');
      }

      const response = await this.sendOtp(email, mobile);

      return response;
    } catch (e) {
      throw new Error(`From AuthService.requestLoginOtp: ${e}`);
    }
  }

  // find auth account by email
  async findByEmail(email: string): Promise<Auth> {
    try {
      const auth = await this.authRepository.findByUniq({ email });
      return auth || null;
    } catch (e) {
      throw new Error(
        `Error from findByEmail method in auth.service.ts.
        with error message: ${e.message}`,
      );
    }
  }

  // method to add a new auth record to database
  async addAuth(auth: Auth): Promise<Auth> {
    try {
      if (!auth) throw new Error('auth is required');

      const params = {
        authId: auth.id,
        email: auth.email,
      };

      const authExist = await this.authRepository.findByUniq(params);

      if (authExist) throw new Error('Auth account already exists');

      const newAuth = await this.authRepository.create(auth).save();

      return newAuth;
    } catch (e) {
      throw new Error(
        `Error from addAuth method in auth.service.ts.
        with error message: ${e.message}`,
      );
    }
  }

  async getAllUserInfo(input: AuthParams): Promise<Auth> {
    const auth = await this.authRepository.getUserWithAuth(input);
    return auth || null;
  }

  /**
   * Generates jwt token with 1 day expiration
   * @param id
   * @returns jwt token
   */
  // public generateJwt(id: string) {
  //   const privateKey = fs.readFileSync('./secrets/private_key.pem');
  //   const token = jsonwebtoken.sign({ id }, privateKey.toString(), {
  //     expiresIn: '1d',
  //   });
  //   return token;
  // }

  public generateJwt(obj: Auth | User) {
    if (obj instanceof Auth) {
      const privateKey = fs.readFileSync('./secrets/private_key.pem');
      const token = jsonwebtoken.sign(
        { authId: obj.id },
        privateKey.toString(),
        {
          expiresIn: '1d',
        },
      );
      return token;
    } else if (obj instanceof User) {
      const privateKey = fs.readFileSync('./secrets/private_key.pem');
      const token = jsonwebtoken.sign(
        { userId: obj.id },
        privateKey.toString(),
        {
          expiresIn: '1d',
        },
      );
      return token;
    }
  }

  /**
   * Retrieves a specific value from the auth repository
   * @param input
   * @returns auth object containing the vlaue
   */
  async getAuth(input: AuthParams): Promise<Auth> {
    const auth = await this.authRepository.findByUniq(input);
    return auth || null;
  }

  async deleteAllRecords() {
    try {
      // delete all auth, address, user and mobile records
      await this.authRepository.createQueryBuilder().delete().execute();
      await this.mobileRepository.createQueryBuilder().delete().execute();
      await this.userRepository.createQueryBuilder().delete().execute();
      await this.addressRepository.createQueryBuilder().delete().execute();
      return true;
    } catch (error) {
      throw error;
    }
  }

  // async deleteRegisteredUsers() {
  //   // so for all accounts in the user and auth account, delete them
  //   const last24Hours = new Date();
  //   last24Hours.setHours(last24Hours.getHours() - 24);

  //   const formattedLast24Hours = last24Hours
  //     .toISOString()
  //     .slice(0, 19)
  //     .replace('T', ' ');

  //   try {
  //     // Delete all auth accounts created in the last 24 hours
  //     const deleteAuthQuery = `DELETE FROM auth WHERE createdTime <= '${formattedLast24Hours}'`;
  //     const deleteUserQuery = `DELETE FROM user WHERE createdTime <= '${formattedLast24Hours}'`;
  //     const deleteAddQuery = `DELETE FROM address WHERE createdTime <= '${formattedLast24Hours}'`;

  //     await this.authRepository.createQueryBuilder(deleteAuthQuery);
  //     await this.userRepository.createQueryBuilder(deleteUserQuery);
  //     await this.addressRepository.createQueryBuilder(deleteAddQuery);
  //   } catch (error) {}
  // }
}
