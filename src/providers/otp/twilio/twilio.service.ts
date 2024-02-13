import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { Twilio } from 'twilio';
import { generateOtpCode } from 'src/providers/util/otp-code-util';
import { EnvConfigService } from 'src/modules/config/env-config.';

@Injectable()
export default class TwilioService {
  private readonly logger = new Logger(TwilioService.name);
  client: Twilio;

  constructor(private readonly configService: EnvConfigService) {
    const TWILIO_ACCOUNT_SID = EnvConfigService.get('TWILIO_ACCOUNT_SID');
    const TWILIO_AUTH_TOKEN = EnvConfigService.get('TWILIO_AUTH_TOKEN');
    this.client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }

  private getClient(): Twilio {
    if (!this.client) {
      const TWILIO_ACCOUNT_SID = EnvConfigService.get('TWILIO_ACCOUNT_SID');
      const TWILIO_AUTH_TOKEN = EnvConfigService.get('TWILIO_AUTH_TOKEN');
      this.client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    }
    return this.client;
  }

  public async sendSms(
    phoneNumber: string,
    codeLength = 4,
    expirationMinutes = 6,
  ) {
    try {
      // initialize twilio client
      this.client = this.getClient();

      this.logger.debug('phone-number to send sms to is: ' + phoneNumber);
      const senderPhoneNumber = EnvConfigService.get('TWILIO_PHONE_NUMBER');

      // generate otp code
      const { code, expiryTime } = generateOtpCode(
        codeLength,
        expirationMinutes,
      );

      const options: MessageListInstanceCreateOptions = {
        to: phoneNumber,
        body: `Quickmart: Please use this OTP to complete verification: ${code}, expires in ${expirationMinutes} minutes.`,
        from: senderPhoneNumber,
      };

      this.client.messages.create(options);

      const maskedNumber = phoneNumber;
      const maskedPhoneNumber = maskedNumber.replace(
        maskedNumber.substring(0, 5),
        '*****',
      );
      const message: string =
        'SMS sent successfully to: \n' +
        maskedPhoneNumber +
        ' with expiry time: ' +
        expiryTime;

      this.logger.debug(message);

      return {
        status: true,
        message,
        code,
        expiryTime,
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
