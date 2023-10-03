import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessRepository } from './business.repository';
import { BusinessFilesService } from '../files/business-files.service';
import { AwsS3Service } from '../files/aws-s3.service';
import { Address } from '../address/entities/address.entity';
import { AddressService } from '../address/address.service';
import { AddressRepository } from '../address/address.respository';
import { GeocodingService } from '../geocoding/geocoding.service';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Address])],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    BusinessRepository,
    BusinessFilesService,
    AddressService,
    AwsS3Service,
    AddressRepository,
    GeocodingService,
  ],
})
export class BusinessModule {}
