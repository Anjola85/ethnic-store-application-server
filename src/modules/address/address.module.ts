import { Module } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { AddressRepository } from './address.respository';

@Module({
  imports: [TypeOrmModule.forFeature([Address, User, Business])],
  controllers: [AddressController],
  providers: [AddressService, AddressRepository],
})
export class AddressModule {}
