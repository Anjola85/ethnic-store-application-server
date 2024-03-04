import { Global, Module } from '@nestjs/common';
import { CountryService } from './country.service';
import { CountryController } from './country.controller';
// import { MongooseModule } from '@nestjs/mongoose';
import { Country } from './entities/country.entity';
import { type } from 'os';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CountryRepository } from './country.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Country])],
  controllers: [CountryController],
  providers: [CountryService, CountryRepository],
})
export class CountryModule {}
