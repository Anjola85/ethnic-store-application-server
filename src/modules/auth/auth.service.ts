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

  // /**
  //  *
  //  * @param loginDto
  //  * @returns
  //  */
  // async login(loginDto: loginDto): Promise<any> {
  //   try {
  //     let user: any = null;
  //     // retrieve user_account_id from user database
  //     if (loginDto.email && loginDto.email !== '') {
  //       user = await this.userAccountService.getUserByEmail(loginDto.email);
  //     } else if (loginDto.mobile && loginDto.mobile.phone_number !== '') {
  //       user = await this.userAccountService.getUserByPhone(loginDto.mobile);
  //     }

  //     if (!user) {
  //       return {
  //         status: false,
  //         message: 'Invalid credentials',
  //         token: '',
  //         user: '',
  //       };
  //     }

  //     const userInfo = user;

  //     // generate token
  //     const privateKey = fs.readFileSync('./private_key.pem');

  //     // sign token with userID
  //     const token = jsonwebtoken.sign(
  //       { id: userInfo.id },
  //       privateKey.toString(),
  //       {
  //         expiresIn: '1d',
  //       },
  //     );
  //     user = {
  //       mobile: userInfo.mobile || null,
  //       firstName: userInfo.firstName,
  //       lastName: userInfo.lastName,
  //       email: userInfo.email || '',
  //       phone_number: userInfo.phone_number ? userInfo.phone_number : '',
  //       address: {
  //         primary: userInfo.address.primary,
  //         other:
  //           userInfo.address.other !== undefined ? userInfo.address.other : '',
  //       },
  //     };

  //     // get password from auth database - this is specific to email
  //     const auth = await this.authRepository.findOne({
  //       user_account_id: userInfo.id,
  //     });

  //     if (loginDto.email && user && Object.keys(auth).length > 0) {
  //       // check if password was provided
  //       if (!loginDto.password) throw new Error('Password is required');

  //       const encryptedPassword: string = auth.password;
  //       const password: string = loginDto.password;

  //       const passwordMatch: boolean = await bcrypt.compare(
  //         password,
  //         encryptedPassword,
  //       );

  //       if (passwordMatch) {
  //         // assign password set in auth database to user object
  //         user.encryptedPassword = encryptedPassword;

  //         return {
  //           status: true,
  //           message: 'user successfully logged in',
  //           token,
  //           user,
  //         };
  //       } else {
  //         throw new UnauthorizedException(
  //           'Invalid credentials, passwords dont match',
  //         );
  //       }
  //     } else if (loginDto.mobile && user !== null) {
  //       // case for phone number

  //       // generate token
  //       const privateKey = fs.readFileSync('./private_key.pem');

  //       // sign token with userID
  //       const token = jsonwebtoken.sign(
  //         { id: userInfo.id },
  //         privateKey.toString(),
  //         {
  //           expiresIn: '1d',
  //         },
  //       );

  //       const user = {
  //         mobile: userInfo.mobile,
  //         firstName: userInfo.firstName,
  //         lastName: userInfo.lastName,
  //         email: userInfo.email ? userInfo.email : '',
  //         phone_number: userInfo.phone_number ? userInfo.phone_number : '',
  //         address: {
  //           primary: userInfo.address.primary,
  //           other:
  //             userInfo.address.other !== undefined
  //               ? userInfo.address.other
  //               : '',
  //         },
  //         encryptedPassword: '',
  //       };

  //       return {
  //         status: true,
  //         message: 'user successfully logged in',
  //         token,
  //         user,
  //       };
  //     } else {
  //       throw new Error('User not found');
  //     }
  //   } catch (e) {
  //     throw new Error(`From AuthService.login: ${e.message}`);
  //   }
  // }

  // async verifyOtp(
  //   otp: string,
  //   entryTime: string,
  //   userId: string,
  // ): Promise<{ message: string; status: boolean }> {
  //   try {
  //     // get auth object
  //     const auth: {
  //       id: string;
  //       account_verified: string;
  //       verification_code: string;
  //       verification_code_expiration: string;
  //     } = await this.authRepository.findOne({
  //       user_account_id: userId,
  //     });

  //     if (auth == null) {
  //       throw new Error('User not found');
  //     }

  //     // logger the retrieved otp and verification code expiration
  //     this.logger.log(
  //       `otp: ${otp}, verification_code: ${auth.verification_code}`,
  //     );

  //     // logger the comparison
  //     this.logger.log(
  //       `tripple equal:: otp === verification_code: ${
  //         otp === auth.verification_code
  //       }`,
  //     );

  //     // logger the comparison
  //     this.logger.log(
  //       `double equal:: otp == verification_code: ${
  //         otp == auth.verification_code
  //       }`,
  //     );

  //     // check if otp matches
  //     if (otp === auth.verification_code) {
  //       // check if otp is expired
  //       const expiryTime = auth.verification_code_expiration;

  //       if (entryTime <= expiryTime) {
  //         // update auth object
  //         await this.authRepository.findByIdAndUpdate(auth.id, {
  //           account_verified: true,
  //         });

  //         // return updated auth
  //         return { message: 'OTP successfully verified', status: true };
  //       } else {
  //         // time elapsed
  //         return { message: 'OTP has expired', status: false };
  //       }
  //     } else {
  //       return { message: 'OTP does not match', status: false };
  //     }
  //   } catch (e) {
  //     throw new Error(
  //       `From AuthService.verifyOtp: Unable to verify otp with error message: ${e.message}`,
  //     );
  //   }
  // }

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
    let auth;

    if (email) {
      // use sendgrid to send otp
      response = await this.sendgridService.sendOTPEmail(email);
      auth = await this.authRepository.findOneBy({ email });
    } else if (mobile) {
      // use twilio to send otp
      const phone_number = mobile?.phone_number || '';
      response = await this.twilioService.sendSms(phone_number);
      auth = await this.authRepository.findOneBy({ mobile });
    }

    if (auth) {
      auth = await this.authRepository.update(auth.id, {
        verification_code: response.code,
        verification_code_expiration: response.expiryTime,
      });
    } else {
      auth = await this.authRepository
        .createQueryBuilder()
        .insert()
        .into(Auth)
        .values({
          mobile,
          email,
          verification_code: response.code,
          verification_code_expiration: response.expiryTime,
        })
        .execute();
    }

    // generate jwt with the auth id
    const privateKey = fs.readFileSync('./private_key.pem');
    const token = jsonwebtoken.sign({ id: auth.id }, privateKey.toString(), {
      expiresIn: '1d',
    });

    // add token to response
    const otpResponse = { ...response, token };

    return otpResponse;
  }

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

  async findByEmailOrMobile(
    email: string,
    mobile: MobileDto,
  ): Promise<Auth | null> {
    try {
      const auth = await this.authRepository
        .createQueryBuilder('user')
        .where('auth.email = :email', { email })
        .orWhere('auth.mobile = :mobile', { mobile })
        .getOne();
      return auth || null;
    } catch (e) {
      throw new Error(
        `Error from findByEmailOrMobile method in user.service.ts.
        with error message: ${e.message}`,
      );
    }
  }

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
}
