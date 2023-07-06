import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAccountService } from '../user_account/user_account.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserAccount,
  UserAccountSchema,
} from '../user_account/entities/user_account.entity';
import { UserService } from '../user/user.service';
import { User, UserSchema } from '../user/entities/user.entity';
import { Customer, CustomerSchema } from '../user/entities/customer.entity';
import { Merchant, MerchantSchema } from '../user/entities/merchant.entity';
import { Auth, AuthSchema } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from '../user_account/entities/temporary_user_account.entity';
import { AwsSecretKey } from 'src/common/util/secret';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Auth.name, schema: AuthSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: TempUserAccount.name, schema: TempUserAccountSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserAccountService,
    UserService,
    SendgridService,
    OTPCodeGenerator,
    TwilioService,
    AwsSecretKey,
  ],
})
export class AuthModule {}
