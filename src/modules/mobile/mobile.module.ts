import { Global, Module } from '@nestjs/common';
import { MobileService } from './mobile.service';
import { MobileRepository } from './mobile.repository';

@Global()
@Module({
  imports: [],
  // controllers: [],
  providers: [MobileService, MobileRepository],
  exports: [MobileRepository],
})
export class MobileModule {}
