import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { SendgridController } from '../otp.controller';
import { UserService } from 'src/modules/user/user.service';
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
import { UserAccountService } from 'src/modules/user_account/user_account.service';
import TwilioService from '../twilio/twilio.service';
import { BullModule } from '@nestjs/bull';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from 'src/modules/user_account/entities/temporary_user_account.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: TempUserAccount.name, schema: TempUserAccountSchema },
    ]),
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
  ],
  providers: [
    SendgridService,
    UserService,
    UserAccountService,
    TwilioService,
    OTPCodeGenerator,
  ],
})
export class SendgridModule {}
