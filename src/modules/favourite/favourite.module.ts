import { Module } from '@nestjs/common';
import { FavouriteService } from './favourite.service';
import { FavouriteController } from './favourite.controller';

@Module({
  controllers: [FavouriteController],
  providers: [FavouriteService]
})
export class FavouriteModule {}
