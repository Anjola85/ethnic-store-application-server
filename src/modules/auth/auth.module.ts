import { UserFileService } from 'src/modules/files/user-files.service';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { AwsSecretKey } from 'src/common/util/secret';
import { Address } from '../address/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from '../files/aws-s3.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import { AddressRepository } from '../address/address.respository';
import { AddressService } from '../address/address.service';
import { GeocodingService } from '../geocoding/geocoding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Auth, User, Address])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    SendgridService,
    TwilioService,
    AddressRepository,
    AddressService,
    AwsSecretKey,
    UserFileService,
    AwsS3Service,
    AuthRepository,
    UserRepository,
    GeocodingService,
  ],
})
export class AuthModule {}
