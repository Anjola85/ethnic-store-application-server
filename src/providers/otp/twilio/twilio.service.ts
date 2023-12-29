import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { Twilio } from 'twilio';
import { generateOtpCode } from 'src/providers/util/otp-code-util';

@Injectable()
export default class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  client: Twilio;

  constructor(private readonly configService: ConfigService) {
    const twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found in config file');
    }

    this.client = new Twilio(twilioAccountSid, twilioAuthToken);
  }

  public async sendSms(
    phone_number: string,
    codeLength = 4,
    expirationMinutes = 6,
  ) {
    this.logger.debug('phone number is: ' + phone_number);

    // quickmartdev from phone number
    const senderPhoneNumber = '+18738000976';

    // generate otp code
    const otpResponse = generateOtpCode(codeLength, expirationMinutes);
    const otpCode: string = otpResponse.code;
    const expiryTime: string = otpResponse.expiryTime;

    const options: MessageListInstanceCreateOptions = {
      to: phone_number,
      body: `Quickmart: Please use this OTP to complete verification: ${otpCode}, expires in ${expirationMinutes} minutes.`,
      from: senderPhoneNumber,
    };
    try {
      // send otp code to phone number
      this.client.messages.create(options);

      // mask phone number
      const maskedNumber = phone_number;
      // replace first 5 digits with *
      const maskedPhoneNumber = maskedNumber.replace(
        maskedNumber.substring(0, 5),
        '*****',
      );

      // log success repsonse
      this.logger.log(
        'SMS sent successfully to: \n' +
          maskedPhoneNumber +
          '\nwith expiry time: ' +
          expiryTime,
      );

      // return success response to client
      return {
        status: true,
        message: 'SMS sent successfully',
        code: otpCode,
        expiryTime: expiryTime,
      };
    } catch (error) {
      // log error response
      this.logger.error('Error sending sms:', error);
      // return error response to client
      throw new HttpException(
        'Failed to send email',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
