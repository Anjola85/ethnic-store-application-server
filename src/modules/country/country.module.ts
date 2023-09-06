import { Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Country } from './entities/country.entity';

@Module({
  imports: [],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
