import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { AuthService } from '../auth/auth.service';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { Auth } from '../auth/entities/auth.entity';
import { UserFileService } from '../files/user-files.service';
import { AwsS3Service } from '../files/aws-s3.service';
import { AuthRepository } from '../auth/auth.repository';
import { UserRepository } from './user.repository';
import { Favourite } from '../favourite/entities/favourite.entity';
import { AddressService } from '../address/address.service';
import { AddressRepository } from '../address/address.respository';

@Module({
  imports: [TypeOrmModule.forFeature([User, Address, Auth, Favourite])],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    SendgridService,
    TwilioService,
    UserFileService,
    AwsS3Service,
    AuthRepository,
    UserRepository,
    AddressService,
    AddressRepository,
  ],
})
export class UserModule {}
