import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import * as SendGrid from '@sendgrid/mail';
import { Model } from 'mongoose';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { UserAccountService } from 'src/modules/user_account/user_account.service';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';

@Injectable()
export class SendgridService {
  // private readonly logger = new Logger(SendgridService.name);
  // constructor(
  //   private readonly configService: ConfigService,
  //   private readonly userAccountService: UserAccountService,
  //   private readonly otpCodeGenerator: OTPCodeGenerator,
  // ) {
  //   SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  // }
  // /**
  //  * This method sends an email to the receiver email address containing the otp code
  //  * @param receiverEmail
  //  * @param emailAddress
  //  * @param name
  //  * @returns Promise<any>
  //  */
  // async sendOTPEmail(
  //   receiverEmail: string,
  //   codeLength = 4,
  //   expirationMinutes = 6,
  // ): Promise<any> {
  //   // email address of sender is quickmartdev
  //   const senderEmailAddress = 'quickmartdev@gmail.com';
  //   // generate otp code
  //   const otpResponse = await this.otpCodeGenerator.generateCode(
  //     codeLength,
  //     expirationMinutes,
  //   );
  //   // set otp code and expiry time
  //   const otpCode: string = otpResponse.code;
  //   const expiryTime: string = otpResponse.expiryTime;
  //   // create mail object
  //   const mail = {
  //     to: receiverEmail,
  //     subject: 'Welcome to Quickmart! One-Time Password (OTP) Verification',
  //     from: senderEmailAddress,
  //     text: `Please verify your email address by entering the OTP code: ${otpCode}`,
  //     html: `<h3>Hello!,</h3>
  //           <p>Thank you for joining Quickmart! <br/> To complete your account registration, please verify your email address by entering the OTP (One-Time Password) code provided below:</p>
  //           <h4>OTP Code: ${otpCode}</h4>
  //           <p>Please enter this code within 5 minutes to verify your account. If you did not sign up for an account with Quickmart, please disregard this email.</p>
  //           <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@quickmart.com</p>
  //           <p>Welcome once again, and we look forward to serving you!</p>
  //           <p>Best regards,<br>Quickmart Team</p>`,
  //   };
  //   try {
  //     // send otp code to email
  //     await this.send(mail);
  //     const maskedEmail = receiverEmail;
  //     // replace first 5 digits with *
  //     const maskedEmailAdd = maskedEmail.replace(
  //       maskedEmail.substring(0, 5),
  //       '*****',
  //     );
  //     // log success repsonse
  //     this.logger.log(
  //       'Email sent successfully to: \n' +
  //         maskedEmailAdd +
  //         '\nwith expiry time: ' +
  //         expiryTime,
  //     );
  //     // return success response to client
  //     return {
  //       status: true,
  //       message: 'Email sent successfully',
  //       code: otpCode,
  //       expiryTime: expiryTime,
  //     };
  //   } catch (error: HttpException | any) {
  //     // log error response
  //     this.logger.error('Error sending email:', error);
  //     // return error response to client
  //     throw new HttpException(
  //       'Failed to send email',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }
  // /**
  //  * This method sends an email to the receiver email address containing the otp code
  //  * @param mail
  //  * @returns
  //  */
  // async send(mail: SendGrid.MailDataRequired) {
  //   const transport = await SendGrid.send(mail);
  //   this.logger.log(`E-Mail sent to ${mail.to}`);
  //   return transport;
  // }
}
