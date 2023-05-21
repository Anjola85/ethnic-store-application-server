import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { Twilio } from 'twilio';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import { InjectModel } from '@nestjs/mongoose';
import { Auth, AuthDocument } from 'src/modules/auth/entities/auth.entity';
import { Model } from 'mongoose';

@Injectable()
export default class TwilioService {
  logger = new Logger(TwilioService.name);
  client: Twilio;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('twilioQueue') private queue: Queue,
    private readonly otpCodeGenerator: OTPCodeGenerator,
    @InjectModel(Auth.name)
    private authModel: Model<AuthDocument> & any,
  ) {
    const twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found in config file');
    }

    this.client = new Twilio(twilioAccountSid, twilioAuthToken);
  }

  public async sendSms(
    userId: string,
    phoneNumber: string,
    codeLength?: number,
    expirationMinutes = 5,
  ) {
    // phone number of sender is quickmartdev
    const senderPhoneNumber = '+14314416827';

    // generate otp code
    const otpResponse = await this.otpCodeGenerator.generateCode(
      codeLength,
      expirationMinutes,
    );
    const otpCode: string = otpResponse.code;
    const expiryTime: Date = otpResponse.expiryTime;

    const options: MessageListInstanceCreateOptions = {
      to: phoneNumber,
      body: `Quickmart: Please use this OTP to complete verification: ${otpCode}, expires in ${expirationMinutes} minutes.`,
      from: senderPhoneNumber,
    };
    try {
      // send otp code to phone number
      const response = this.client.messages.create(options);

      // get auth object from database
      const auth = await this.authModel.findOne({
        user_account_id: userId,
      });
      // save otp code to database
      auth.verification_code = otpCode;
      auth.verify_code_expiration = expiryTime;
      await auth.save();

      // log success repsonse
      this.logger.log('SMS sent successfully\n' + response + '\n'); //TODO: log might be too verbose

      // return success response to client
      return {
        message: 'SMS sent successfully',
        emailAddress: phoneNumber,
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

  // async send(options: MessageListInstanceCreateOptions): Promise<any> {
  //   // adds a job to the queue, returns a promise from method sendSms
  //   const job = await this.queue.add('sendSms', options);

  //   return job.finished();
  // }

  // async processSendSmsJob(job: Job<MessageListInstanceCreateOptions>) {
  //   try {
  //     await this.sendSms(job.data);
  //   } catch (error) {
  //     this.logger.debug(
  //       `SMS to ${job.data.to} failed, retrying (${job.attemptsMade} attempts left)`,
  //       error,
  //     );
  //     throw error;
  //   }
  // }
}
