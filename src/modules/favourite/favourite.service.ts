import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Favourite } from './entities/favourite.entity';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { FavouriteRepository } from './favourite.repository';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { FavouriteListRespDto } from 'src/contract/version1/response/favourite-response.dto';
import { FavouriteProcessor } from './favourite.process';

@Injectable()
export class FavouriteService {
  private readonly logger = new Logger(FavouriteService.name);
  constructor(
    private favouriteRepository: FavouriteRepository,
    private readonly userService: UserService,
  ) {}

  async addToFavourites(userId: number, business: Business) {
    try {
      // check if user exists
      const userExists: User = await this.userService.getUserById(userId);

      if (!userExists) throw new NotFoundException('User not found');

      const newUser = new User();
      newUser.id = userExists.id;
      const newBusiness = Object.assign(new Business(), business);

      // check if favourite exists for user
      const favouriteExist: Favourite =
        await this.favouriteRepository.favouriteExist(userId, business.id);

      if (
        favouriteExist &&
        favouriteExist.business.id === business.id &&
        !favouriteExist.deleted
      ) {
        throw new NotFoundException('Business already favourited');
      } else if (favouriteExist && favouriteExist.deleted) {
        favouriteExist.deleted = false;
        await this.favouriteRepository.save(favouriteExist);
        return favouriteExist;
      }

      // add to favourites
      const favourite: Favourite =
        await this.favouriteRepository.addToFavourites(newUser, newBusiness);
      return favourite;
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.service.ts, addToFavourites method: ' +
          error +
          ' with error message: ' +
          error.message,
      );
      throw error;
    }
  }

  async getFavouriteByUserId(id: number): Promise<FavouriteListRespDto> {
    try {
      const favouriteList: Favourite[] =
        await this.favouriteRepository.getFavouritesWithBusinessDetails(id);

      const favouriteListRespDto: FavouriteListRespDto =
        FavouriteProcessor.mapEntityListToResp(favouriteList);
      return favouriteListRespDto;
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.service.ts, getFavouriteByUserId method: ' +
          error +
          ' with error message: ' +
          error.message,
      );
      throw error;
    }
  }

  async removeFromFavourites(favourite: Favourite): Promise<void> {
    try {
      const favouriteId: number = favourite.id;
      await this.favouriteRepository.removeFromFavourites(favouriteId);
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.service.ts, removeFromFavourites method: ' +
          error +
          ' with error message: ' +
          error.message,
      );
      throw error;
    }
  }
}
