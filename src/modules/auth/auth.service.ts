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
import { CreateAuthDto } from './dto/create-auth.dto';
import { Mobile } from '../mobile/mobile.entity';
import { MobileService } from '../mobile/mobile.service';
import { SecureLoginDto } from './dto/secure-login.dto';
import { LoginOtpRequest } from 'src/contract/version1/request/auth/loginOtp.request';
import { OtpPayloadResp } from 'src/contract/version1/response/otp-response.dto';
import { SignupOtpRequest } from 'src/contract/version1/request/auth/signupOtp.request';
import { UserService } from '../user/user.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AddressService } from '../address/address.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private mobileService: MobileService,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
    private readonly userSerivce: UserService,
    private readonly addressService: AddressService,
  ) {}

  /**
   * Sends otp to provided email or mobile and update auth record with otp code
   * @param email
   * @param mobile
   * @returns
   */
  async sendOtp(email?: string, mobile?: MobileDto): Promise<OtpPayloadResp> {
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

          // TODO: bad code, move this to controller
          newMobile = await this.mobileService.addMobile(newMobile, true);
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
      const otpPayload: OtpPayloadResp = { ...response, token };

      return otpPayload;
    } catch (error) {
      // catch database errors and throw a new error for the controller to handle
      this.logger.error(`From AuthService.sendOtp: ${error.message}`);

      throw new Error(`From AuthService.sendOtp: ${error.message}`);
    }
  }

  /**
   * Verifies the OTP code
   * @param authId
   * @param otp
   * @returns
   */
  async verifyOtp(
    authId: number,
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

  /**
   *
   * @param email
   * @returns
   */
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
  async updateAuthEmailOrMobile(authDto: CreateAuthDto): Promise<any> {
    const authId = authDto.id;
    if (!authId) throw new Error('authId is required');
    if (!authDto) throw new Error('authDto is required');
    if (!authDto.email && !authDto.mobile)
      throw new Error('email or mobile is required');

    let auth = null;
    if (authDto.email)
      auth = await this.authRepository.updateEmail(authId, authDto.email);
    else if (authDto.mobile)
      auth = await this.mobileService.updateMobile(authDto.mobile, {
        auth: authId,
      });

    return auth;
  }

  /**
   * If user exists, throw error
   * If user does not exist, sendOTP
   * @param body
   */
  async signupOtpRequest(body: SignupOtpRequest): Promise<OtpPayloadResp> {
    try {
      const { email, mobile } = body;

      if (mobile) {
        // console.log('checking if mobile exists');
        const registeredMobile = await this.mobileService.getMobile(mobile);

        if (registeredMobile)
          throw new ConflictException('phone number already exists');

        // console.log('mobile does not exist');
      } else if (email) {
        const auth = await this.findByEmail(body.email);

        if (auth) throw new ConflictException('email already exists');
      }

      // console.log('sending otp');

      const auth: OtpPayloadResp = await this.sendOtp(body.email, body.mobile);

      // console.log(auth);

      if (null == auth)
        throw new Error('From signupOtpRequest: sendOTP returned null');

      return auth;
    } catch (error) {
      this.logger.debug(
        'Error thrown in user.service.ts, requestSignup method: ' + error,
      );

      throw error;
    }
  }

  /**
   * This method registers a user and returns the user
   * pre-condition: userDto must have mobile provided
   * @param userDto
   * @returns
   */
  async registerUser(userDto: UserDto): Promise<any> {
    try {
      let userModel: User;
      let userExists: boolean;

      const mobile = new Mobile();
      Object.assign(mobile, userDto.mobile);

      const registeredMobile = await this.mobileService.getMobile(mobile);

      const auth: Auth = registeredMobile?.auth || null;

      if (auth) {
        if (auth.user) {
          // user already exists
          userExists = true;
          userModel = auth.user;
        } else {
          // user does not exist
          userExists = false;
          userDto.auth = auth;
          userModel = await this.userSerivce.addUser(userDto);
        }

        // TODO: generate random avatar
        // if (!userDto.profileImage)
        //   userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
        // else
        //   userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        //     newUserEntity.id,
        //     userDto.profileImage,
        //   );

        this.logger.debug('user registered successfully');

        // generate jwt token with user id
        const token = this.generateJwt(userModel);

        return { token, userModel, userExists };
      } else {
        throw new Error(
          'Mobile does not have auth, this SHOULD NEVER HAPPEN, sendOTP should be called before this',
        );
      }
    } catch (error) {
      this.logger.debug(
        'Error thrown in user.service.ts, register method: ' + error,
      );
    }
  }

  /**
   * This method logs in a user and returns the user information and token
   * @param loginDto
   * @returns
   */
  async loginUser(loginDto: SecureLoginDto): Promise<any> {
    try {
      this.logger.debug(
        `login endpoint called with body LoginDto: ${JSON.stringify(loginDto)}`,
      );

      // verify if OTP is correct

      if (!loginDto.email && !loginDto.mobile)
        throw new Error('email or mobile is required');

      let authId: number;

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

  /**
   * // TODO: option to receive OTP
   * This methods generates and sends OTP to the user's email or mobile
   * @param body
   * @returns
   */
  async loginOtpRequest(body: LoginOtpRequest): Promise<OtpPayloadResp> {
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

  /**
   * This method adds a new auth account to the database
   * @param auth
   * @returns
   */
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

  /**
   * TODO: modify this method
   * Sends all the information pertaining to a user - user information
   * @param input
   * @returns
   */
  async getAllUserInfo(input: AuthParams): Promise<Auth> {
    const auth = await this.authRepository.getUserWithAuth(input);
    return auth || null;
  }

  /**
   * Generates jwt token with 1 day expiration
   * @param obj
   * @returns
   */
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

  // TODO: implement this method to delete whatever user that got created
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

  /**
   * This updates an existing user's info
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(userDto: UpdateUserDto): Promise<void> {
    // check if user exists
    const user = await this.userSerivce.getUserById(userDto.id);

    if (!user) throw new Error('User not found');

    await this.userSerivce.updateUserInfo(userDto);

    // email or mobile provided
    if (userDto.email || userDto.mobile) {
      const authDto = new CreateAuthDto();
      authDto.id = user.auth.id;
      authDto.email = userDto?.email;
      authDto.mobile = userDto?.mobile;
      await this.updateAuthEmailOrMobile(authDto);
    }

    // update address
    if (userDto.address) this.addressService.updateAddress(userDto.address);
  }
}
