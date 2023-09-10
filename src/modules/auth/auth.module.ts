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
import { User } from '../user/entities/user.entity';
import { Customer, CustomerSchema } from '../user/entities/customer.entity';
import { Merchant, MerchantSchema } from '../user/entities/merchant.entity';
import { Auth } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from '../user_account/entities/temporary-user-account.entity';
import { AwsSecretKey } from 'src/common/util/secret';
import { Address } from '../user/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, User, Address])],
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
