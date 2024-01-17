import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { Auth, AuthParams } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { User } from '../user/entities/user.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { secureLoginDto } from './dto/secure-login.dto';
import { AuthRepository } from './auth.repository';
import { UserDto } from '../user/dto/user.dto';
import { UserFileService } from '../files/user-files.service';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Mobile } from '../mobile/mobile.entity';
import { MobileService } from '../mobile/mobile.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private mobileService: MobileService,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
    private readonly userFileService: UserFileService,
  ) {}

  /**
   * Sends otp to provided email or mobile
   * @param email
   * @param mobile
   * @returns
   */
  async sendOtp(
    email?: string,
    mobile?: MobileDto,
  ): Promise<{ message; code; expiryTime; token }> {
    try {
      let response: { message; code; expiryTime };

      // TODO: replace this with a call to the microservice to handle call to sendgrid and twilio through Kafka or RabbitMQ
      // if (mobile && mobile?.phoneNumber)
      //   response = await this.twilioService.sendSms(mobile.phoneNumber);
      // else if (email) response = await this.sendgridService.sendOTPEmail(email);

      // TODO: take out below - debug mode
      response = {
        code: '123456',
        expiryTime: new Date(Date.now() + 60000),
        message: 'OTP sent successfully',
      };

      const authModel: Auth = new Auth();

      Object.assign(authModel, {
        email,
        otpCode: response.code,
        otpExpiry: response.expiryTime,
      });

      // if mobile was provided, check if mobile exists in the database(means auth exists)
      if (mobile && mobile.phoneNumber) {
        this.logger.debug(`mobile provided: ${JSON.stringify(mobile)}`);

        const mobileEntity = new Mobile();
        Object.assign(mobileEntity, mobile);

        // check if mobile exists in the DB
        const mobileExist: Mobile = await this.mobileService.getMobile(
          mobileEntity,
        );

        let auth: Auth;

        if (mobileExist && mobileExist.auth) {
          this.logger.debug(
            `mobile exists, updating the auth's otp code for ${mobile.phoneNumber}`,
          );

          // theres a user with this mobile, update the auth record with the new otp
          auth = mobileExist.auth;
          await this.authRepository.update(auth.id, {
            ...authModel,
          });
        } else if (mobileExist && mobileExist.business) {
          this.logger.debug(`mobile ${mobile} is registered to business`);

          throw new ConflictException('Mobile is registered to a business');

          // if mobile exists and its for a business, create an auth record for it
          this.logger.debug(
            'mobile is registered to business, but creating an auth record for it',
          );

          // create an auth record for it
          auth = await this.addAuth(authModel);

          // save the mobile with the auth record
          mobileExist.auth = auth;
          this.mobileService.updateMobile(mobileExist, { auth });
        } else {
          this.logger.debug(
            `mobile doesnt exist, creating a new auth and mobile record for ${mobile.phoneNumber}`,
          );

          auth = await this.addAuth(authModel);
          console.log('auth: ' + JSON.stringify(auth));

          let newMobile = new Mobile();
          Object.assign(newMobile, {
            ...mobile,
            auth,
          });

          newMobile = await this.mobileService.addUserMobile(newMobile, auth);
          console.log('newMobile: ' + JSON.stringify(newMobile));
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
          // authAcct = await this.authRepository.create(authModel).save();
        }

        authModel.id = authAcct.id;
      }

      // generate token with user id
      const token = this.generateJwt(authModel);

      // return response with token
      const otpResponse = { ...response, token };

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

  async findByEmail(email: string): Promise<Auth> {
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
  async login(loginDto: secureLoginDto): Promise<any> {
    try {
      const input: AuthParams = {
        email: loginDto.email,
      };
      const authAcct = await this.getAllUserInfo(input);

      if (!authAcct) throw new Error('Invalid credentials');

      if (!authAcct.user)
        throw new Error(
          'User has incomlete registeration, please complete registeration',
        );

      // generate token with userID
      const token = this.generateJwt(authAcct.user);

      // const user: UserDto = mapAuthToUser(authAcct);
      const user: UserDto = null;

      return { token, user };
    } catch (e) {
      throw new Error(`From AuthService.login: ${e.message}`);
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
