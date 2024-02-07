import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import TwilioService from './twilio.service';
import { EnvConfigService } from 'src/modules/config/env-config.';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
  ],
  providers: [EnvConfigService, TwilioService],
})
export class TwilioModule {}
