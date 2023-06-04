import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigService } from '@nestjs/config';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import TwilioService from './twilio.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/modules/user/entities/user.entity';
import {
  Customer,
  CustomerSchema,
} from 'src/modules/user/entities/customer.entity';
import {
  Merchant,
  MerchantSchema,
} from 'src/modules/user/entities/merchant.entity';
import {
  UserAccount,
  UserAccountSchema,
} from 'src/modules/user_account/entities/user_account.entity';
import { Auth, AuthSchema } from 'src/modules/auth/entities/auth.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: Auth.name, schema: AuthSchema },
    ]),
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
