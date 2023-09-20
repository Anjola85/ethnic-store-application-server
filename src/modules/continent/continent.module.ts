import { Module } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';
import { Continent } from './entities/continent.entity';

@Module({
  imports: [],
  controllers: [ContinentController],
  providers: [ContinentService],
})
export class ContinentModule {}
