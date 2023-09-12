import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { UserService } from 'src/modules/user/user.service';
import TwilioService from '../twilio/twilio.service';
import { BullModule } from '@nestjs/bull';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Address } from 'src/modules/user/entities/address.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { UserFileService } from 'src/modules/files/user-files.service';
import { AwsS3Service } from 'src/modules/files/aws-s3.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
    TypeOrmModule.forFeature([User, Address, Auth]),
  ],
  providers: [
    SendgridService,
    UserService,
    TwilioService,
    OTPCodeGenerator,
    AuthService,
    UserFileService,
    AwsS3Service,
  ],
})
export class SendgridModule {}
