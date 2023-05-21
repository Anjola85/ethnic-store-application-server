import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as SendGrid from '@sendgrid/mail';
import { Model } from 'mongoose';
import { Auth, AuthDocument } from 'src/modules/auth/entities/auth.entity';
import { UserAccountService } from 'src/modules/user_account/user_account.service';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userAccountService: UserAccountService,
    private readonly otpCodeGenerator: OTPCodeGenerator,
    @InjectModel(Auth.name)
    private authModel: Model<AuthDocument> & any,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  /**
   * This method sends an email to the receiver email address containing the otp code
   * @param receiverEmail
   * @param emailAddress
   * @param name
   * @returns Promise<any>
   */
  async sendOTPEmail(
    userId: string,
    receiverEmail: string,
    codeLength?: number,
    expirationMinutes?: number,
    firstName?: string,
  ): Promise<any> {
    // email address of sender is quickmartdev
    const senderEmailAddress = 'quickmartdev@gmail.com';

    // generate otp code
    const otpResponse = await this.otpCodeGenerator.generateCode(
      codeLength,
      expirationMinutes,
    );
    const otpCode: string = otpResponse.code;
    const expiryTime: Date = otpResponse.expiryTime;

    // Get name from DB if name was not provided get firstname from user database
    if (!firstName || firstName === '' || firstName === undefined) {
      // get user from database
      const user = await this.userAccountService.findOne(userId);
      firstName = user.firstName;
    }

    // create mail object
    const mail = {
      to: receiverEmail,
      subject: 'Welcome to Quickmart! Verify Your Account',
      from: senderEmailAddress,
      text: `Please verify your account by entering the OTP code: ${otpCode}`,
      html: `<h3>Hello ${firstName},</h3>
            <p>Thank you for joining Quickmart! <br/> To complete your account registration, please verify your email address by entering the OTP (One-Time Password) code provided below:</p>
            <h4>OTP Code: ${otpCode}</h4>
            <p>Please enter this code within 5 minutes to verify your account. If you did not sign up for an account with Quickmart, please disregard this email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@quickmart.com</p>
            <p>Welcome once again, and we look forward to serving you!</p>
            <p>Best regards,<br>Quickmart Team</p>`,
    };

    try {
      // send otp code to email
      const result = await this.send(mail);

      // get auth object from database
      const auth = await this.authModel.findOne({
        user_account_id: userId,
      });
      // save otp code to database
      auth.verification_code = otpCode;
      auth.verify_code_expiration = expiryTime;
      await auth.save();

      // log success repsonse
      this.logger.log('Email sent successfully\n' + result + '\n'); //TODO: log might be too verbose

      // return success response to client
      return {
        message: 'Email sent successfully',
        emailAddress: receiverEmail,
      };
    } catch (error: HttpException | any) {
      // log error response
      this.logger.error('Error sending email:', error);
      // return error response to client
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * This method sends an email to the receiver email address containing the otp code
   * @param mail
   * @returns
   */
  async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    this.logger.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }
}
