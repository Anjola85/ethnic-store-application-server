import { Module } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { WaitlistController } from './waitlist.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WaitlistCustomer } from './entities/waitlist_customer.entity';
import { WaitlistBusiness } from './entities/waitlist_business';
import { WaitlistShopper } from './entities/waitlist_shopper';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WaitlistCustomer,
      WaitlistBusiness,
      WaitlistShopper,
    ]),
  ],
  controllers: [WaitlistController],
  providers: [WaitlistService],
})
export class WaitlistModule {}
