import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { UserAccountService } from '../user_account/user_account.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { Auth, AuthDocument } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { User, UserDocument } from '../user/entities/user.entity';
import {
  UserAccount,
  UserAccountDocument,
} from '../user_account/entities/user_account.entity';
import {
  TempUserAccount,
  TempUserAccountDocument,
} from '../user_account/entities/temporary_user_account.entity';
import { Customer, CustomerDocument } from '../user/entities/customer.entity';
import AWS from 'aws-sdk';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(Auth.name)
    protected authModel: Model<AuthDocument> & any,
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
    // delete from here,
    @InjectModel(User.name)
    private userModel: Model<UserDocument> & any,
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument> & any,
    @InjectModel(TempUserAccount.name)
    private tempUserAccountModel: Model<TempUserAccountDocument> & any,
    @InjectModel(Customer.name)
    private customerModel: Model<CustomerDocument> & any,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
    userID: string,
  ): Promise<{ token; message }> {
    try {
      const response: { message; code; expiryTime; token } = await this.sendOTP(
        userID,
        createAuthDto.email,
        createAuthDto.mobile.phoneNumber,
      );

      // set default value for password
      if (
        createAuthDto.password === undefined ||
        createAuthDto.password === null
      ) {
        createAuthDto.password = '';
      }

      // create new auth object
      const auth = new this.authModel({
        password: createAuthDto.password,
        user_account_id: userID,
        verification_code: response.code,
        verification_code_expiration: response.expiryTime,
      });

      // save auth object
      await auth.save();

      // send back token
      return { token: response.token, message: response.message };
    } catch (e) {
      throw new Error(`From AuthService.create method: ${e.message}`);
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  /**
   *
   * @param loginDto
   * @returns
   */
  async login(loginDto: loginDto): Promise<any> {
    try {
      let user: any;

      // retrieve user_account_id from user database
      if (loginDto.email !== '') {
        user = await this.userAccountService.getUserByEmail(loginDto.email);
      } else if (loginDto.phone !== '') {
        user = await this.userAccountService.getUserByPhone(loginDto.phone);
      }
      const userId: string = user[0].id;

      // get password from auth database
      const auth = await this.authModel.find({ user_account_id: userId });

      if (user != null && Object.keys(auth).length > 0) {
        const encryptedPassword: string = auth[0].password;

        const passwordMatch: boolean = await bcrypt.compare(
          loginDto.password,
          encryptedPassword,
        );

        if (passwordMatch) {
          // generate token
          const privateKey = fs.readFileSync('./private_key.pem');
          const token = jsonwebtoken.sign(
            { id: user.id, email: loginDto.email },
            privateKey.toString(),
            {
              expiresIn: '1d',
            },
          );

          // return user
          return {
            message: 'user successfully logged in',
            token,
            user,
            encryptedPassword: encryptedPassword,
          };
        } else {
          throw new UnauthorizedException(
            'Invalid credentials, passwords dont match',
          );
        }
      } else {
        throw new Error('User not found');
      }
    } catch (e) {
      throw new Error(`From AuthService.login: ${e.message}`);
    }
  }

  async verifyOtp(
    otp: string,
    entryTime: string,
    userId: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      // get auth object
      const auth: {
        id: string;
        account_verified: string;
        verification_code: string;
        verification_code_expiration: string;
      } = await this.authModel.findOne({
        user_account_id: userId,
      });

      if (auth == null) {
        throw new Error('User not found');
      }

      // check if account is already verified
      if (auth.account_verified) {
        return { message: 'Account already verified', verified: true };
      }

      // logger the retrieved otp and verification code expiration
      this.logger.log(
        `otp: ${otp}, verification_code: ${auth.verification_code}`,
      );

      // logger the comparison
      this.logger.log(
        `tripple equal:: otp === verification_code: ${
          otp === auth.verification_code
        }`,
      );

      // logger the comparison
      this.logger.log(
        `double equal:: otp == verification_code: ${
          otp == auth.verification_code
        }`,
      );

      // check if otp matches
      if (otp === auth.verification_code) {
        // check if otp is expired
        const expiryTime = auth.verification_code_expiration;

        if (entryTime <= expiryTime) {
          // update auth object
          await this.authModel.findByIdAndUpdate(auth.id, {
            account_verified: true,
          });

          // return updated auth
          return { message: 'OTP successfully verified', verified: true };
        } else {
          // time elapsed
          return { message: 'OTP has expired', verified: false };
        }
      } else {
        return { message: 'OTP does not match', verified: false };
      }
    } catch (e) {
      throw new Error(`From AuthService.verifyOtp: ${e.message}`);
    }
  }

  /**
   * Update account by user_account_id
   * @param authDto
   * @param userId
   * @returns
   */
  async updateAccount(authDto: CreateAuthDto, userId: string) {
    try {
      // get auth object
      const auth = await this.authModel.findOne({ user_account_id: userId });

      if (auth == null) {
        throw new Error('User not found in auth database');
      }

      // decrypt password, hash and update the variable
      // const encryptedPassword: string = authDto.password;

      // const kmsClient = new AWS.KMS();

      // const params = {
      //   CiphertextBlob: Buffer.from(encryptedPassword, 'base64'),
      // };

      // const response = await kmsClient.decrypt(params).promise();
      // const decryptedPayload = response.Plaintext.toString('utf-8');

      // update auth object
      await this.authModel.findByIdAndUpdate(auth.id, {
        ...authDto,
      });

      // return updated auth
      return await this.authModel.findOne({ user_account_id: userId });
    } catch (e) {
      throw new Error(`From AuthService.updateAccount: ${e.message}`);
    }
  }

  /**
   * THis method sends otp to user
   * @param userID
   * @param email
   * @param phoneNumber
   * @returns
   */
  async sendOTP(
    userID: string,
    email?: string,
    phoneNumber?: string,
  ): Promise<{ message; code; expiryTime; token }> {
    let response: { message; code; expiryTime };
    if (email != null) {
      // use sendgrid to send otp
      response = await this.sendgridService.sendOTPEmail(userID, email);
    } else if (phoneNumber != null) {
      // use twilio to send otp
      response = await this.twilioService.sendSms(userID, phoneNumber);
    }

    // generate jwt
    const privateKey = fs.readFileSync('./private_key.pem');
    const token = jsonwebtoken.sign({ id: userID }, privateKey.toString(), {
      expiresIn: '1d',
    });

    // add token to response
    const otpResponse = { ...response, token };

    return otpResponse;
  }

  /**
   * THis method resends otp to user
   * @param userID
   * @param email
   * @param phoneNumber
   * @returns
   */
  async resendOtp(
    userID: string,
    email?: string,
    phoneNumber?: string,
  ): Promise<{ message; code; expiryTime; token }> {
    let response: { message; code; expiryTime };
    if (email != null) {
      // use sendgrid to send otp
      response = await this.sendgridService.sendOTPEmail(userID, email);
    } else if (phoneNumber != null) {
      // use twilio to send otp
      response = await this.twilioService.sendSms(userID, phoneNumber);
    }
    // update auth account verification code and expiry time
    await this.authModel.findOneAndUpdate(
      { user_account_id: userID },
      {
        verification_code: response.code,
        verification_code_expiration: response.expiryTime,
      },
    );

    // generate jwt
    const privateKey = fs.readFileSync('./private_key.pem');
    const token = jsonwebtoken.sign({ id: userID }, privateKey.toString(), {
      expiresIn: '1d',
    });

    // add token to response
    const otpResponse = { ...response, token };

    return otpResponse;
  }

  /**
   * THis endpoint is to test twilio send sms feature
   * @param phoneNumber
   * @returns
   */
  async sendOTPBySmsTest(phoneNumber: string) {
    try {
      await this.twilioService.sendSmsTest(phoneNumber);
      return { success: true, message: 'SMS sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send SMS.' };
    }
  }

  /**
   * TODO: to be deleted after testing auth
   * THis method deletes registered users on that current day for testing purposes
   * @returns
   */
  async resetRegisteredUsers() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); // Set the time to 00:00:00.000

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); // Set the time to 23:59:59.999

    try {
      await this.authModel.deleteMany({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });

      await this.userModel.deleteMany({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });
      await this.userAccountModel.deleteMany({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });
      await this.customerModel.deleteMany({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });
      await this.tempUserAccountModel.deleteMany({
        createdAt: { $gte: startOfDay, $lt: endOfDay },
      });

      return { success: true, message: 'Reset successful' };
    } catch (error) {
      return { success: false, message: 'Reset failed from auth.service.ts' };
    }
  }
}
