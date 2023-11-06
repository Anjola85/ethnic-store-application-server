import { UserFileService } from 'src/modules/files/user-files.service';
import { Global, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { Auth } from './entities/auth.entity';
import { AwsSecretKey } from 'src/common/util/secret';
import { Address } from '../address/entities/address.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AwsS3Service } from '../files/aws-s3.service';
import { AuthRepository } from './auth.repository';
import { UserRepository } from '../user/user.repository';
import { AddressRepository } from '../address/address.respository';
import { GeocodingService } from '../geocoding/geocoding.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Auth, User, Address])],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserService,
    AddressRepository,
    AwsSecretKey,
    UserFileService,
    AwsS3Service,
    AuthRepository,
    UserRepository,
    GeocodingService,
  ],
  exports: [AuthService, AwsSecretKey, AwsS3Service],
})
export class AuthModule {}
