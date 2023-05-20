import { Module } from '@nestjs/common';
import TwilioService from './twilio.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
  ],
  providers: [TwilioService],
  exports: [TwilioService],
})
export class TwilioModule {}
