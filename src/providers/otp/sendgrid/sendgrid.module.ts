import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { UserService } from 'src/modules/user/user.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User } from 'src/modules/user/entities/user.entity';
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
import { Auth } from 'src/modules/auth/entities/auth.entity';
import TwilioService from '../twilio/twilio.service';
import { BullModule } from '@nestjs/bull';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from 'src/modules/user_account/entities/temporary_user_account.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
  ],
  providers: [SendgridService, UserService, TwilioService, OTPCodeGenerator],
})
export class SendgridModule {}
