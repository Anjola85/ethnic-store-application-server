import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { Auth } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { User } from '../user/entities/user.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { secureLoginDto } from './dto/secure-login.dto';
import { AuthRepository, InputObject } from './auth.repository';
import { mapDtoToEntity } from './auth-mapper';
import { mapAuthToUser } from '../user/user-mapper';
import { UserDto } from '../user/dto/user.dto';
import { UserFileService } from '../files/user-files.service';
import { mobileToEntity } from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private authRepository: AuthRepository,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
    private readonly userFileService: UserFileService,
  ) {}

  /**
   *
   * @param email
   * @param mobile
   * @returns
   */
  async sendOtp(
    email?: string,
    mobile?: MobileDto,
  ): Promise<{ message; code; expiryTime; token }> {
    let response: { message; code; expiryTime };

    if (email) {
      response = await this.sendgridService.sendOTPEmail(email);
    } else if (mobile) {
      const phone_number = mobile?.phoneNumber || '';
      response = await this.twilioService.sendSms(phone_number);
    }

    const authModel: Auth = mapDtoToEntity({ email, mobile });

    authModel.verification_code = response.code;
    authModel.verification_code_expiration = response.expiryTime;

    let auth = await this.authRepository.findByUniq({
      userId: authModel.user?.id,
      email,
      mobile,
    });

    if (!auth) {
      auth = await this.authRepository.create(authModel).save();
    } else {
      auth.verification_code = response.code;
      auth.verification_code_expiration = response.expiryTime;
      await this.authRepository.save(auth);
    }

    const token = this.generateJwt(auth.id);
    const otpResponse = { ...response, token };

    return otpResponse;
  }

  async verifyOtp(
    authId: string,
    otp: string,
  ): Promise<{ message: string; status: boolean }> {
    this.logger.debug(`Verifying OTP for authId: ${authId}`);
    const auth = await this.authRepository.findOneBy({ id: authId });

    if (auth == null) throw new Error('Could not find associated account');

    const expiryTime = new Date(
      auth.verification_code_expiration,
    ).toISOString();

    const entryTime = new Date(Date.now()).toISOString();

    if (entryTime <= expiryTime) {
      if (otp === auth.verification_code) {
        await this.authRepository.update(authId, {
          ...auth,
          account_verified: true,
        });

        return { message: 'OTP successfully verified', status: true };
      } else {
        // return { message: 'OTP has expired', status: false };
        throw new UnauthorizedException('OTP does not match');
      }
    } else {
      //return { message: 'OTP does not match', status: false };
      throw new UnauthorizedException('OTP has expired');
    }
  }

  async findByEmailOrMobile(
    email: string,
    mobileDto: MobileDto,
  ): Promise<Auth> {
    try {
      const mobile = mobileToEntity(mobileDto);

      const auth = await this.authRepository
        .createQueryBuilder('auth')
        .where('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', {
          mobile,
        })
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
      const input: InputObject = {
        email: loginDto.email,
        mobile: loginDto.mobile,
      };
      const authAcct = await this.getAllUserInfo(input);

      if (!authAcct) throw new Error('Invalid credentials');

      if (!authAcct.user)
        throw new Error(
          'User has incomlete registeration, please complete registeration',
        );

      const userAcct = authAcct.user;

      // generate token with userID
      const token = this.generateJwt(userAcct.id);

      const user: UserDto = mapAuthToUser(authAcct);

      return { token, user };
    } catch (e) {
      throw new Error(`From AuthService.login: ${e.message}`);
    }
  }

  async getAllUserInfo(input: InputObject): Promise<Auth> {
    const auth = await this.authRepository.getUserWithAuth(input);
    return auth || null;
  }

  /**
   * Generates jwt token with 1 day expiration
   * @param id
   * @returns jwt token
   */
  public generateJwt(id: string) {
    const privateKey = fs.readFileSync('./private_key.pem');
    const token = jsonwebtoken.sign({ id }, privateKey.toString(), {
      expiresIn: '1d',
    });
    return token;
  }

  async getAuth(input: InputObject): Promise<Auth> {
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
