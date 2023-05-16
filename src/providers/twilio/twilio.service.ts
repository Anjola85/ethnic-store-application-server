import PQueue from 'p-queue';
import pRetry from 'p-retry';
import twilio from 'twilio';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MessageListInstanceCreateOptions } from 'twilio/lib/rest/api/v2010/account/message';
import TwilioClient from 'twilio/lib/rest/Twilio';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message';

@Injectable()
export default class TwilioService {
  client: TwilioClient;

  logger = new Logger(TwilioService.name);

  private queue = new PQueue({ concurrency: 1 });

  constructor(private configService: ConfigService) {
    const twilioAccountSid = configService.get<string>('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = configService.get<string>('TWILIO_AUTH_TOKEN');

    if (!twilioAccountSid || !twilioAuthToken) {
      throw new Error('Twilio account SID/auth token not found');
    }

    this.client = twilio(twilioAccountSid, twilioAuthToken);
  }

  /**
   * This method sends the SMS using the Twilio client.
   * @param options
   * @returns
   */
  private async sendSms(
    options: MessageListInstanceCreateOptions,
  ): Promise<MessageInstance> {
    return this.client.messages.create(options);
  }

  /**
   * This methods adds the SMS to the queue and returns a promise that resolves when the SMS is sent.
   * @param options
   * @returns
   */
  send(options: MessageListInstanceCreateOptions): Promise<any | void> {
    return this.queue.add(() =>
      // retry sending SMS if it fails
      pRetry(() => this.sendSms(options), {
        // if failed attempt is not the last one, log the error and retry
        onFailedAttempt: (error) => {
          this.logger.debug(
            `SMS to ${options.to} failed, retrying (${error.retriesLeft} attempts left)`,
            error,
          );
        },
        // retry 3 times
        retries: this.configService.get<number>('twilio.retries') ?? 3,
      }),
    );
  }
}
