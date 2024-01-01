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
      this.client.messages.create(options);

      const maskedNumber = phone_number;
      const maskedPhoneNumber = maskedNumber.replace(
        maskedNumber.substring(0, 5),
        '*****',
      );

      this.logger.debug(
        'SMS sent successfully to: \n' +
          maskedPhoneNumber +
          ' with expiry time: ' +
          expiryTime,
      );

      return {
        status: true,
        message: 'SMS sent successfully',
        code: otpCode,
        expiryTime: expiryTime,
      };
    } catch (error) {
      this.logger.error('Error sending sms:', error);

      throw new HttpException(
        'Failed to send sms',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
