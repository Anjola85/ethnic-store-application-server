import { Global, Module } from '@nestjs/common';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Favourite } from './entities/favourite.entity';
import { FavouriteRepository } from './favourite.repository';
import { BusinessRepository } from '../business/business.repository';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Favourite, User, Business])],
  controllers: [FavouriteController],
  providers: [FavouriteService, FavouriteRepository, BusinessRepository],
  exports: [FavouriteService, FavouriteRepository],
})
export class FavouriteModule {}
