import { Module } from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Business } from './entities/business.entity';
import { BusinessRepository } from './business.repository';
import { BusinessFilesService } from '../files/business-files.service';
import { Address } from '../address/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, Address])],
  controllers: [BusinessController],
  providers: [BusinessService, BusinessRepository, BusinessFilesService],
})
export class BusinessModule {}
