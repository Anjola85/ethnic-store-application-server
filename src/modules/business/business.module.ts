import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { CountryModule } from '../country/country.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([Business]), CountryModule, UserModule],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    // CategoryService,
    // CountryService,
    // ContinentService,
  ],
})
export class BusinessModule {}
