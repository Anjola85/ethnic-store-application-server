import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { loginDto } from './dto/login.dto';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { Auth } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { User } from '../user/entities/user.entity';
import {
  TempUserAccount,
  TempUserAccountDocument,
} from '../user_account/entities/temporary-user-account.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { secureLoginDto } from './dto/secure-login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(Auth) private authRepository: Repository<Auth>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
  ) {
    // @InjectModel(TempUserAccount.name)
    // private tempUserAccountModel: Model<TempUserAccountDocument> & any,
  }

  /**
   * This method sends otp to user
   * @param userID
   * @param email
   * @param phone_number
   * @returns
   */
  async sendOtp(
    email?: string,
    mobile?: MobileDto,
  ): Promise<{ message; code; expiryTime; token }> {
    let response: { message; code; expiryTime };
    // let auth;

    if (email) {
      // use sendgrid to send otp
      response = await this.sendgridService.sendOTPEmail(email);
      // auth = await this.authRepository.findOneBy({ email });
    } else if (mobile) {
      // use twilio to send otp
      const phone_number = mobile?.phone_number || '';
      response = await this.twilioService.sendSms(phone_number);
      // auth = await this.authRepository.findOneBy({ mobile });
    }

    // console.log('auth: ', auth);

    // Try to find an existing authentication record by email or mobile
    let auth = await this.authRepository.findOne({
      where: [{ email }, { mobile }],
    });

    // If no record exists, create a new one
    if (!auth) {
      auth = this.authRepository.create({
        ...auth,
        mobile,
        email,
        verification_code: response.code,
        verification_code_expiration: response.expiryTime,
      });
      await this.authRepository.save(auth);
    } else {
      // Update the existing record with the OTP code
      auth.verification_code = response.code;
      auth.verification_code_expiration = response.expiryTime;
      await this.authRepository.save(auth);
    }

    // auth = await this.authRepository.preload({
    //   ...auth,
    //   mobile,
    //   email,
    //   verification_code: response.code,
    //   verification_code_expiration: response.expiryTime,
    // });

    // auth = await this.authRepository.save(auth);

    // generate jwt with the auth id
    const token = this.generateJwt(auth.id);

    // add token to response
    const otpResponse = { ...response, token };

    return otpResponse;
  }

  async verifyOtp(
    authId: string,
    otp: string,
    entryTime: string,
  ): Promise<{ message: string; status: boolean }> {
    try {
      // console.log('authId: ', authId);
      const auth = await this.authRepository.findOneBy({ id: authId });

      if (auth == null) throw new Error('Could not find associated account');

      if (otp === auth.verification_code) {
        const expiryTime = new Date(
          auth.verification_code_expiration,
        ).toISOString();

        if (entryTime <= expiryTime) {
          await this.authRepository.update(authId, {
            ...auth,
            account_verified: true,
          });

          return { message: 'OTP successfully verified', status: true };
        } else {
          return { message: 'OTP has expired', status: false };
        }
      } else {
        return { message: 'OTP does not match', status: false };
      }
    } catch (e) {
      throw new Error(
        `From AuthService.verifyOtp: Unable to verify otp with error message: ${e.message}`,
      );
    }
  }

  async findByEmailOrMobile(email: string, mobile: MobileDto): Promise<Auth> {
    try {
      // console.log('email: ', email);
      // console.log('mobile: ', mobile);

      const auth = await this.authRepository
        .createQueryBuilder('auth')
        .leftJoinAndSelect('auth.user', 'user') // Include the user relationship
        .leftJoinAndSelect('user.addresses', 'addresses') // Include the addresses relationship
        .where('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', { mobile })
        .getOne();

      if (!auth)
        throw new UnauthorizedException(
          'no auth account found with provided credentials',
        );

      return auth;
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

  // async create(
  //   authDto: CreateAuthDto,
  //   userID: string,
  // ): Promise<{ token; message }> {
  //   try {
  //     const { email, mobile } = authDto;
  //     const response: { message; code; expiryTime; token } = await this.sendOTP(
  //       userID,
  //       email,
  //       mobile,
  //     );

  //     // create new auth object
  //     const auth = await this.authRepository
  //       .create({
  //         ...authDto,
  //         user: userID,
  //       })
  //       .save();

  //     // save auth object
  //     await auth.save();

  //     // send back token
  //     return { token: response.token, message: response.message };
  //   } catch (e) {
  //     throw new Error(`From AuthService.create method: ${e.message}`);
  //   }
  // }

  /**
   *
   * @param loginDto
   * @returns
   */
  async login(loginDto: secureLoginDto): Promise<any> {
    try {
      const authAcct = await this.findByEmailOrMobile(
        loginDto.email,
        loginDto.mobile,
      );

      if (!authAcct) throw new Error('Invalid credentials');

      // incomplete registeration if userId is null
      if (!authAcct.user) throw new Error('User has incomlete registeration');

      // retrieve user from user database
      const userAcct = await this.userRepository.findOneBy({
        id: authAcct.user.id,
      });

      // generate token with userID
      const token = this.generateJwt(userAcct.id);

      return {
        status: true,
        message: 'login successful',
        token,
        user: { userAcct, authAcct },
      };
    } catch (e) {
      throw new Error(`From AuthService.login: ${e.message}`);
    }
  }

  // /**
  //  * Update account by user_account_id
  //  * @param authDto
  //  * @param userId
  //  * @returns
  //  */
  // async updateAccount(authDto: CreateAuthDto, userId: string) {
  //   try {
  //     // get auth object
  //     const auth = await this.authRepository.findOne({
  //       user_account_id: userId,
  //     });

  //     if (auth == null) {
  //       throw new Error('User not found in auth database');
  //     }

  //     const saltRounds = 10;
  //     authDto.password = await bcrypt.hash(authDto.password, saltRounds);

  //     // update auth object
  //     await this.authRepository.findByIdAndUpdate(auth.id, {
  //       ...authDto,
  //     });

  //     // return updated auth
  //     return await this.authRepository.findOne({ user_account_id: userId });
  //   } catch (e) {
  //     throw new Error(`From AuthService.updateAccount: ${e.message}`);
  //   }
  // }

  // /**
  //  * This method resends otp to user
  //  * It sends the otp to the user and updates the auth DB
  //  * @param userID
  //  * @param email
  //  * @param phone_number
  //  * @returns
  //  */
  // async resendOtp(
  //   userID: string,
  //   email?: string,
  //   mobile?: MobileDto,
  // ): Promise<{ status; message; code; expiryTime; token }> {
  //   let response: { status; message; code; expiryTime };
  //   if (email != null && email.length !== 0) {
  //     response = await this.sendgridService.sendOTPEmail(email);
  //   } else if (mobile !== null) {
  //     if (mobile.phone_number === undefined || mobile.phone_number === null) {
  //       throw new Error('Phone number is required');
  //     }
  //     const phone_number = mobile.phone_number;
  //     response = await this.twilioService.sendSms(phone_number);
  //   }

  //   // update auth account verification code and expiry time
  //   await this.updateAuthOtp(userID, response.code, response.expiryTime);

  //   // generate jwt
  //   const privateKey = fs.readFileSync('./private_key.pem');
  //   const token = jsonwebtoken.sign({ id: userID }, privateKey.toString(), {
  //     expiresIn: '1d',
  //   });

  //   // add token to response
  //   const otpResponse = { ...response, token };

  //   return otpResponse;
  // }

  // async updateAuthOtp(
  //   userID: string,
  //   code: string,
  //   expiryTime: string,
  // ): Promise<void> {
  //   await this.authRepository.findOneAndUpdate(
  //     { user_account_id: userID },
  //     {
  //       verification_code: code,
  //       verification_code_expiration: expiryTime,
  //     },
  //   );
  // }

  /**
   * This endpoint is to test twilio send sms feature
   * @param phone_number
   * @returns
   */
  async sendOTPBySmsTest(phone_number: string) {
    try {
      await this.twilioService.sendSmsTest(phone_number);
      return { success: true, message: 'SMS sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send SMS.' };
    }
  }

  // /**
  //  * TODO: to be deleted after testing auth
  //  * THis method deletes registered users on that current day for testing purposes
  //  * @returns
  //  */
  // async resetRegisteredUsers() {
  //   // const startOfDay = new Date();
  //   // startOfDay.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000
  //   // const endOfDay = new Date();
  //   // endOfDay.setHours(23, 59, 59, 999); // Set the time to 23:59:59.999
  //   // try {
  //   //   await this.authRepository.deleteMany({
  //   //     createdAt: { $gte: startOfDay, $lt: endOfDay },
  //   //   });
  //   //   await this.userRepository.deleteMany({
  //   //     createdAt: { $gte: startOfDay, $lt: endOfDay },
  //   //   });
  //   //   await this.userAccountModel.deleteMany({
  //   //     createdAt: { $gte: startOfDay, $lt: endOfDay },
  //   //   });
  //   //   await this.customerModel.deleteMany({
  //   //     createdAt: { $gte: startOfDay, $lt: endOfDay },
  //   //   });
  //   //   await this.tempUserAccountModel.deleteMany({
  //   //     createdAt: { $gte: startOfDay, $lt: endOfDay },
  //   //   });
  //   //   return { success: true, message: 'Reset successful' };
  //   // } catch (error) {
  //   //   return { success: false, message: 'Reset failed from auth.service.ts' };
  //   // }
  // }

  /**
   * Generates jwt token with 1 day expiration
   * @param id
   * @returns jwt token
   */
  private generateJwt(id: string) {
    const privateKey = fs.readFileSync('./private_key.pem');
    const token = jsonwebtoken.sign({ id }, privateKey.toString(), {
      expiresIn: '1d',
    });
    return token;
  }
}
