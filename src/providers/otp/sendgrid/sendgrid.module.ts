import { Global, Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { UserService } from 'src/modules/user/user.service';
import TwilioService from '../twilio/twilio.service';
import { BullModule } from '@nestjs/bull';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { AuthService } from 'src/modules/auth/auth.service';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { UserFileService } from 'src/modules/files/user-files.service';
import { AwsS3Service } from 'src/modules/files/aws-s3.service';
import { AuthRepository } from 'src/modules/auth/auth.repository';
import { UserRepository } from 'src/modules/user/user.repository';
import { AddressRepository } from 'src/modules/address/address.respository';
import { GeocodingService } from 'src/modules/geocoding/geocoding.service';
import { MobileRepository } from 'src/modules/mobile/mobile.repository';
import { EnvConfigService } from 'src/modules/config/env-config.service';

@Global()
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
    AuthService,
    UserFileService,
    AwsS3Service,
    AuthRepository,
    UserRepository,
    AddressRepository,
    GeocodingService,
    MobileRepository,
    EnvConfigService,
  ],
  exports: [SendgridService, TwilioService],
})
export class SendgridModule {}
