import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import TwilioService from './twilio.service';

@Module({
  imports: [
    // MongooseModule.forFeature([
    //   { name: User.name, schema: UserSchema },
    //   { name: Customer.name, schema: CustomerSchema },
    //   { name: Merchant.name, schema: MerchantSchema },
    //   { name: UserAccount.name, schema: UserAccountSchema },
    //   { name: Auth.name, schema: AuthSchema },
    // ]),
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
  ],
  providers: [ConfigService, OTPCodeGenerator, TwilioService],
})
export class TwilioModule {}
