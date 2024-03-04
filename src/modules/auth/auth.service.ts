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
import {
  AuthOtppRespDto,
  OtpRespDto,
} from 'src/contract/version1/response/otp-response.dto';
import { SignupOtpRequest } from 'src/contract/version1/request/auth/signupOtp.request';
import { UserService } from '../user/user.service';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { AddressService } from '../address/address.service';
import { SignupOtpRespDto } from 'src/contract/version1/response/signup-otp-response.dto';
import { getCurrentEpochTime } from 'src/common/util/functions';
import { LoginOtpRespDto } from 'src/contract/version1/response/login-otp-response.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserProcessor } from '../user/user.processor';
import { SignupRespDto } from 'src/contract/version1/response/signup-response.dto';
import {
  UserInformationRespDto,
  UserRespDto,
} from 'src/contract/version1/response/user-response.dto';
import { LoginRespDto } from 'src/contract/version1/response/login-response.dto';
import { AddressRespDto } from 'src/contract/version1/response/address-response.dto';
import { Address } from '../address/entities/address.entity';
import { AddressProcessor } from '../address/address.processor';
import { MobileProcessor } from '../mobile/mobile.processor';
import { UpdateAuthDto } from './dto/update-auth.dto';

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

  async genrateOtp(email?: string, mobile?: MobileDto): Promise<OtpRespDto> {
    let response: OtpRespDto;

    // TOOD: undo
    // if (email) response = await this.sendgridService.sendOTPEmail(email);
    // else if (mobile)
    //   response = await this.twilioService.sendSms(mobile.phoneNumber);

    //TODO: remove
    response = {
      message: 'OTP sent',
      code: '1234',
      expiryTime: getCurrentEpochTime() + 300000000000,
    };

    return response;
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

    const expiryTime = auth.otpExpiry;

    const currentTime = getCurrentEpochTime();

    if (currentTime <= expiryTime) {
      const validOtpCode = auth.otpCode == otp;

      if (validOtpCode) {
        this.logger.debug('OTP successfully verified');
        await this.authRepository.update(authId, {
          ...auth,
          accountVerified: true,
        });
        return { message: 'OTP successfully verified', status: true };
      } else {
        this.logger.error('OTP does not match');
        throw new UnauthorizedException('OTP does not match');
      }
    } else {
      this.logger.error('OTP has expired');
      throw new UnauthorizedException('OTP has expired');
    }
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

  /**
   * This method updates the email or mobile of an auth account
   * @param authDto
   * @returns - updated auth account
   */
  async updateAuthEmailOrMobile(authDto: UpdateAuthDto): Promise<Auth> {
    if (!authDto || !authDto.id) throw new Error('authId is required');

    if (!authDto.email && !authDto.mobile)
      throw new Error('email or mobile is required to update');

    const authId = authDto.id;

    let auth: Auth;

    if (authDto.email) {
      auth = await this.authRepository.updateEmail(authId, authDto.email);
    }

    if (authDto.mobile) {
      authDto.mobile.auth = authId;
      const mobileEntity: Mobile = await this.mobileService.updateMobile(
        authDto.mobile,
      );
    }

    auth = await this.authRepository.unverifyAccount(authId);

    return auth;
  }

  /**
   * This method sends OTP to the user's email or mobile and returns the OTP payload[]
   * If user exists, throw error
   * If user does not exist, sendOTP
   * @param body
   */
  async signupOtpRequest(body: SignupOtpRequest): Promise<SignupOtpRespDto> {
    try {
      // retrieve email and mobile from body
      const { email, mobile } = body;

      let authAccount: Auth;

      // check if mobile was provided
      if (mobile) {
        // get mobile if it exists
        const registeredMobile =
          await this.mobileService.getMobileByPhoneNumber(mobile);

        if (
          registeredMobile &&
          registeredMobile.auth &&
          registeredMobile.auth.id
        ) {
          // get auth account if mobile is registered
          authAccount = await this.authRepository.findOneBy({
            id: registeredMobile.auth.id,
          });
        } else {
          // create auth account if mobile does not exist
          const auth = new Auth();
          auth.email = email;

          // create new mobile entity, copy mobile object to new mobile entity
          let newMobile: Mobile = Object.assign(new Mobile(), mobile);
          newMobile = await this.mobileService.registerMobile(mobile);

          // update auth account with new mobile
          auth.mobile = newMobile;

          // register auth account
          authAccount = await this.registerAuthAccount(auth);

          // reassign mobile with auth id
          newMobile.auth = authAccount;

          Object.assign(mobile, newMobile);

          // update mobile record with auth Id
          await newMobile.save();
          // await this.mobileService.updateMobile(mobile);
        }
      } else if (email) {
        // get email if it exists
        authAccount = await this.findByEmail(body.email);

        // create new auth account if email does not exist
        if (!authAccount) {
          const auth = new Auth();
          auth.email = email;
          authAccount = await this.registerAuthAccount(auth);
        }
      }

      // check if user has been registered and verified
      if (authAccount && authAccount.accountVerified && authAccount.user)
        return { userExists: true } as SignupOtpRespDto;

      const otpResp: OtpRespDto = await this.genrateOtp(email, mobile);
      const token = this.generateJwt(authAccount);

      // save to auth
      authAccount.otpCode = otpResp.code;
      authAccount.otpExpiry = otpResp.expiryTime;
      await this.authRepository.update(authAccount.id, authAccount);

      const signupOtpResp = {
        ...otpResp,
        userExists: false,
        token: token,
      } as SignupOtpRespDto;

      return signupOtpResp;
    } catch (error) {
      this.logger.debug(
        'Error thrown in auth.service.ts, signupOtpRequest method: ' + error,
      );

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a user with a duplicate email or mobile: ${body.email} ${body.mobile}`,
        );

        throw new ConflictException(
          `User with email ${body.email} or mobile ${body.mobile} already exists`,
        );
      }

      throw error;
    }
  }

  /**
   * This method registers a user and returns the user
   * pre-condition:
   * - user auth account must exist
   * - user must have a mobile number in auth account
   * - user must not exist
   *
   * @param userDto
   * @returns SignupRespDto
   */
  async registerUser(reqBody: CreateUserDto): Promise<SignupRespDto> {
    try {
      const userDto: UserDto = Object.assign(new UserDto(), reqBody);

      const registeredMobile: Mobile =
        await this.mobileService.getMobileByPhoneNumber(userDto.mobile);

      if (!registeredMobile)
        throw new NotFoundException(
          'Inomplete registration process! Mobile is not registered',
        );

      console.log(
        'registeredMobile: ',
        JSON.stringify(registeredMobile, null, 2),
      );

      if (registeredMobile.auth.user !== null) {
        throw new ConflictException('User already exists');
      }

      userDto.auth = registeredMobile.auth;

      const user: User = await this.userSerivce.register(userDto);

      // generate jwt token with userId
      const token = this.generateJwt(user);

      const response: SignupRespDto = {
        token,
        userInfo: UserProcessor.processUserRelationInfo(user, registeredMobile),
      };

      return response;
    } catch (error) {
      this.logger.debug(
        'Error thrown in auth.service.ts, registerUser method: ' + error,
      );
      throw error;
    }
  }

  /**
   * Registers email for an existing auth account
   * @param email
   * @param authId
   * @throws ConflictException if email exists
   */
  async registerEmail(email: string, authId: number): Promise<void> {
    try {
      // get auth record with authId
      const auth = await this.authRepository.findOneBy({ id: authId });
      auth.email = email;
      await this.authRepository.update(authId, auth);
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a auth with a duplicate email: ${email}`,
        );

        throw new ConflictException(`Auth with email ${email} already exists`);
      }

      this.logger.error(
        `Error from registerEmail method in auth.service.ts.
        with error message: ${error.message}`,
      );

      throw new Error(
        `Error from registerEmail method in auth.service.ts.
        with error message: ${error.message}`,
      );
    }
  }

  /**
   * This method logs in a user and returns the user information and token
   * @param loginDto
   * @returns
   */
  async loginUser(
    loginDto: SecureLoginDto,
    authId: number,
  ): Promise<LoginRespDto> {
    try {
      if (!loginDto.email && !loginDto.mobile)
        throw new Error('email or mobile is required');

      // let authId: number;

      // if (loginDto.mobile) {
      //   const mobileEntity: Mobile =
      //     await this.mobileService.getMobileByPhoneNumber(loginDto.mobile);

      //   if (!mobileEntity)
      //     throw new HttpException('User not registered', HttpStatus.NOT_FOUND);
      //   else if (!mobileEntity.auth)
      //     throw new Error('Mobile is not registered to a user');

      //   authId = mobileEntity.auth.id;
      // }

      // const input: AuthParams = {
      //   email: loginDto.email,
      //   authId,
      // };

      // pull all user info from the database
      const authAcct: Auth = await this.authRepository.getUserByAuthId(authId);

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

      const userInfo: UserInformationRespDto = await this.getUserInfoByUser(
        authAcct.user.id,
      );

      // generate token with userID
      const token = this.generateJwt(authAcct.user);

      // const user: UserDto = new UserDto();
      // Object.assign(user, authAcct.user);

      const response: LoginRespDto = {
        token,
        userInfo,
      };

      return response;
    } catch (e) {
      this.logger.debug(`Error thrown in auth.service.ts, loginUser: ${e}`);

      if (e instanceof HttpException) throw e;

      throw new Error(`An error occured in auth.service.ts, loginUser: ${e}`);
    }
  }

  /**
   * // TODO: option to receive OTP
   * This methods generates and sends OTP to the user's email or mobile
   * @param body
   * @returns
   */
  async loginOtpRequest(body: LoginOtpRequest): Promise<LoginOtpRespDto> {
    try {
      const { email, mobile } = body;
      let authAccount: Auth;

      if (!email && !mobile)
        throw new BadRequestException('email or mobile is required');

      if (mobile) {
        const registeredMobile =
          await this.mobileService.getMobileByPhoneNumber(mobile);

        if (!registeredMobile)
          throw new NotFoundException('Mobile is not registered');

        authAccount = registeredMobile.auth;
      } else {
        const authExist = await this.authRepository.findByUniq({ email });

        if (!authExist) throw new NotFoundException('Email is not registered');

        authAccount = authExist;
      }

      console.log('heree: ', authAccount.user);

      // check if user is registered
      if (!authAccount.user)
        throw new NotFoundException('User is not registered');

      const otpResponse: OtpRespDto = await this.genrateOtp(email, mobile);

      const token = this.generateJwt(authAccount);

      // save to auth
      authAccount.otpCode = otpResponse.code;
      authAccount.otpExpiry = otpResponse.expiryTime;
      authAccount.save();

      const response: LoginOtpRespDto = {
        ...otpResponse,
        userExists: false,
        token,
      };

      return response;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new Error(`From AuthService.requestLoginOtp: ${error}`);
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
  async registerAuthAccount(auth: Auth): Promise<Auth> {
    try {
      this.logger.debug(
        `Registering new auth account: ${JSON.stringify(auth)}`,
      );
      const newAuth = await this.authRepository.create(auth).save();
      return newAuth;
    } catch (error) {
      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a auth with a duplicate email: ${auth.email}`,
        );

        throw new ConflictException(
          `Auth with email ${auth.email} already exists`,
        );
      }

      throw new Error(
        `Error from registerAuthAccount method in auth.service.ts.
        with error message: ${error.message}`,
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
   * This method retrieves a user's information by user id
   * @param userId
   * @returns User Information including FAVOURITES, ADDRESSES, MOBILE
   */
  async getUserInfoByUser(userId: number): Promise<UserInformationRespDto> {
    try {
      if (!userId) throw new Error('userId is required to get info');

      const user: User = await this.userSerivce.getUserRelationsById(userId);

      const mobile: Mobile = await this.mobileService.getMobileByAuth(
        user.auth,
      );
      const userInfo: UserInformationRespDto =
        await UserProcessor.processUserRelationInfo(user, mobile);
      return userInfo;
    } catch (error) {
      this.logger.error(
        `Error from getUserInfoByUser method in auth.service.ts.
        with error: ${error}`,
      );
      throw new Error(
        `Error from getUserInfoByUser method in auth.service.ts.
        with error message: ${error.message}`,
      );
    }
  }

  /**
   * Generates jwt token with 1 day expiration
   * @param obj
   * @returns
   */
  public generateJwt(obj: Auth | User): string {
    const privateKey = fs.readFileSync('./secrets/private_key.pem');
    if (obj instanceof Auth) {
      const token = jsonwebtoken.sign(
        { authId: obj.id as number },
        privateKey.toString(),
        {
          expiresIn: '1d',
        },
      );
      return token;
    } else if (obj instanceof User) {
      const token = jsonwebtoken.sign(
        { userId: obj.id as number },
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

  /**
   * This updates an existing user's info
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(
    userDto: UpdateUserDto,
    userId: number,
  ): Promise<UserRespDto> {
    const user: User = await this.userSerivce.getUserInfoById(userId);

    if (!user) {
      this.logger.error('User account not found');
      throw new NotFoundException('User account not foound');
    }

    let auth: Auth = user.auth;

    const updatedUserResp: UserRespDto = await this.userSerivce.updateUserInfo(
      userDto,
      user,
    );

    const authDto: UpdateAuthDto = Object.assign(
      new CreateAuthDto(),
      user.auth,
    );

    if (userDto.email) {
      authDto.email = userDto.email;
    }

    if (userDto.mobile) {
      authDto.mobile.phoneNumber = userDto.mobile.phoneNumber;
      authDto.mobile.countryCode = userDto.mobile.countryCode;
      authDto.mobile.isoType = userDto.mobile.isoType;
    }

    if (userDto.email || userDto.mobile) {
      auth = await this.updateAuthEmailOrMobile(authDto);
      updatedUserResp.email = auth.email;
      updatedUserResp.mobile = MobileProcessor.mapEntityToResp(auth.mobile);
    }

    // update address
    if (userDto.address) {
      const addressResp: Address = await this.addressService.updateAddress(
        userDto.address,
      );
      const addressDto = AddressProcessor.mapEntityToResp(addressResp);

      // look for the address id in the user's address list and replace it with the new address
      updatedUserResp.addressList.addressList =
        updatedUserResp.addressList.addressList.map((address) =>
          address.id === addressDto.id ? addressDto : address,
        );
    }

    return updatedUserResp;
  }
}
