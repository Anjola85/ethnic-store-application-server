import { Global, Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileRepository } from './mobile.repository';
import { MobileController } from './mobile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mobile } from './mobile.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Mobile])],
  controllers: [MobileController],
  providers: [MobileService, MobileRepository],
  exports: [MobileService],
})
export class MobileModule {}
