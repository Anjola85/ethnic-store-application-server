import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UserAccountService } from '../user_account/user_account.service';
import { AuthService } from '../auth/auth.service';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from './entities/address.entity';
import { Auth } from '../auth/entities/auth.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, Auth])],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    SendgridService,
    OTPCodeGenerator,
    TwilioService,
  ],
})
export class UserModule {}
