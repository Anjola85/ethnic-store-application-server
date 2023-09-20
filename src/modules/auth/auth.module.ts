import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserAccountService } from '../user_account/user_account.service';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { AwsSecretKey } from 'src/common/util/secret';
import { Address } from '../user/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserFileService } from '../files/user-files.service';
import { AwsS3Service } from '../files/aws-s3.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, User, Address])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserAccountService,
    UserService,
    SendgridService,
    TwilioService,
    AwsSecretKey,
    UserFileService,
    AwsS3Service,
    AuthRepository,
    UserRepository,
  ],
})
export class AuthModule {}
