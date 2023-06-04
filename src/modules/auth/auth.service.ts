import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { UserAccountService } from '../user_account/user_account.service';
import { UserService } from '../user/user.service';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { NotFoundError } from 'rxjs';
import { Auth, AuthDocument } from './entities/auth.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { MobileUtil } from 'src/common/util/mobileUtil';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(Auth.name)
    protected authModel: Model<AuthDocument> & any,
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
    private readonly sendgridService: SendgridService,
    private readonly twilioService: TwilioService,
  ) {}

  async create(
    createAuthDto: CreateAuthDto,
    userID: string,
  ): Promise<{ token; message }> {
    try {
      // send OTP code to email or phoen number
      const response: { message; code; expiryTime; token } = await this.sendOTP(
        userID,
        createAuthDto.email,
        createAuthDto.mobile.phoneNumber,
      );

      // set default value for password
      if (
        createAuthDto.hashedPassword === undefined ||
        createAuthDto.hashedPassword === null
      ) {
        createAuthDto.hashedPassword = '';
      }

      // create new auth object
      const auth = new this.authModel({
        password: createAuthDto.hashedPassword,
        user_account_id: userID,
        verification_code: response.code,
        verify_code_expiration: response.expiryTime,
      });

      // save auth object
      await auth.save();

      // send back token
      return { token: response.token, message: response.message };
    } catch (e) {
      throw new Error(`From AuthService.create method: ${e.message}`);
    }
  }

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

        // check if password matches, the encrypted password is store in auth
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
    entryTime: Date,
    userId: string,
  ): Promise<{ message: string; verified: boolean }> {
    try {
      // TODO: decrypt otp here

      // get auth object
      const auth = await this.authModel.findOne({ user_account_id: userId });

      if (auth == null) {
        throw new Error('User not found');
      }

      // check if account is already verified
      if (auth.account_verified) {
        return { message: 'Account already verified', verified: true };
      }

      // check if otp matches
      if (otp === auth.verification_code) {
        // check if otp is expired
        const expiryTime = auth.verification_code_expiration;

        if (entryTime.getTime() <= expiryTime.getTime()) {
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

  // resendOtp method

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
}
