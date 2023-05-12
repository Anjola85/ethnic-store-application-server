import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Business, BusinessSchema } from './entities/business.entity';
import {
  Continent,
  ContinentSchema,
} from '../continent/entities/continent.entity';
import { CategoryService } from '../category/category.service';
import { CountryService } from '../country/country.service';
import { ContinentService } from '../continent/continent.service';
import { Country, CountrySchema } from '../country/entities/country.entity';
import { Category, CategorySchema } from '../category/entities/category.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
      { name: Continent.name, schema: ContinentSchema },
      { name: Category.name, schema: CategorySchema },
      { name: Country.name, schema: CountrySchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    CategoryService,
    CountryService,
    ContinentService,
  ],
})
export class BusinessModule {}
