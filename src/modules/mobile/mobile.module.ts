import { Global, Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileRepository } from './mobile.repository';
import { MobileController } from './mobile.controller';

@Global()
@Module({
  imports: [],
  controllers: [MobileController],
  providers: [MobileService, MobileRepository],
  exports: [MobileService],
})
export class MobileModule {}
