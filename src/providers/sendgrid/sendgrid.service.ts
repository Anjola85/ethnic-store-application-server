import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { UserAccountService } from 'src/modules/user_account/user_account.service';

@Injectable()
export class SendgridService {
  private readonly logger = new Logger(SendgridService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly userAccountService: UserAccountService,
  ) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async sendEmail(
    receiverEmail: string,
    emailAddress: string,
    name?: string,
  ): Promise<any> {
    const otpCode: string = this.generateOTP(); // Generate the OTP code

    let firstName: string;

    if (name !== null && name !== '') {
      firstName = name;
    } else {
      // if name was not provided get firstname from user database
      const user = await this.userAccountService.getUserByEmail(emailAddress);
      firstName = user[0].firstName;
    }

    const mail = {
      to: receiverEmail,
      subject: 'Welcome to Quickmart! Verify Your Account',
      from: 'quickmartdev@gmail.com',
      text: `Please verify your account by entering the OTP code: ${otpCode}`,
      html: `<h3>Hello ${firstName},</h3>
            <p>Thank you for joining Quickmart! <br/> To complete your account registration, please verify your email address by entering the OTP (One-Time Password) code provided below:</p>
            <h4>OTP Code: ${otpCode}</h4>
            <p>Please enter this code within 3 minutes to verify your account. If you did not sign up for an account with Quickmart, please disregard this email.</p>
            <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team at support@quickmart.com</p>
            <p>Welcome once again, and we look forward to serving you!</p>
            <p>Best regards,<br>Quickmart Team</p>`,
    };

    try {
      // call the send method from the Sendgrid library
      const result = await this.send(mail);
      this.logger.log('Email sent successfully\n' + result + '\n'); //TODO: log might be too verbose
      return { message: 'Email sent successfully', otpCode: otpCode };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async send(mail: SendGrid.MailDataRequired) {
    const transport = await SendGrid.send(mail);
    this.logger.log(`E-Mail sent to ${mail.to}`);
    return transport;
  }

  generateOTP(): string {
    const digits = '0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = Math.floor(Math.random() * digits.length);
      otp += digits[randomIndex];
    }

    return otp;
  }
}
