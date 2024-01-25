import { Module } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';
import { Continent } from './entities/continent.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Continent])],
  controllers: [ContinentController],
  providers: [ContinentService],
})
export class ContinentModule {}
