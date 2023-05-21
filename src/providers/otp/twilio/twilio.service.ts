import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import { InjectQueue } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { Twilio } from 'twilio';

@Injectable()
export default class TwilioService {
  logger = new Logger(TwilioService.name);
  client: Twilio;

  constructor(
    private readonly configService: ConfigService,
    @InjectQueue('twilioQueue') private queue: Queue,
  ) {
    const twilioAccountSid =
      this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found in config file');
    }

    this.client = new Twilio(twilioAccountSid, twilioAuthToken);
  }

  public async sendSms(options: MessageListInstanceCreateOptions) {
    // sends an SMS message
    try {
      const response = this.client.messages.create(options);
    } catch (e) {
      console.log('Error sending SMS');
      this.logger.error('Error sending SMS', e);
      throw e;
    }
  }

  async send(options: MessageListInstanceCreateOptions): Promise<any> {
    // adds a job to the queue, returns a promise from method sendSms
    const job = await this.queue.add('sendSms', options);

    return job.finished();
  }

  async processSendSmsJob(job: Job<MessageListInstanceCreateOptions>) {
    try {
      await this.sendSms(job.data);
    } catch (error) {
      this.logger.debug(
        `SMS to ${job.data.to} failed, retrying (${job.attemptsMade} attempts left)`,
        error,
      );
      throw error;
    }
  }
}
