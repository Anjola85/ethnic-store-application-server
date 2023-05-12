import { Module } from '@nestjs/common';
import { ContinentService } from './continent.service';
import { ContinentController } from './continent.controller';
import { Continent, ContinentSchema } from './entities/continent.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Continent.name, schema: ContinentSchema },
    ]),
  ],
  controllers: [ContinentController],
  providers: [ContinentService],
})
export class ContinentModule {}
