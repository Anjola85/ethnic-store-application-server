import { GeocodingService } from 'src/modules/geocoding/geocoding.service';
import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { AddressService } from '../address/address.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from '../address/entities/address.entity';
import { WaitlistCustomer } from './entities/waitlist_customer.entity';
import { WaitlistBusiness } from './entities/waitlist_business';
import { WaitlistShopper } from './entities/waitlist_shopper';
import { AddressRepository } from '../address/address.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Address,
      WaitlistCustomer,
      WaitlistBusiness,
      WaitlistShopper,
    ]),
  ],
  controllers: [WaitlistController],
  providers: [
    WaitlistService,
    AddressService,
    AddressRepository,
    GeocodingService,
  ],
})
export class WaitlistModule {}
