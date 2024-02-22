import { Injectable } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Favourite } from './entities/favourite.entity';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';
import { FavouriteRepository } from './favourite.repository';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class FavouriteService {
  constructor(private favouriteRepository: FavouriteRepository) {}

  async addToFavourites(user: User, business: Business) {
    const favourite: Favourite = await this.favouriteRepository.addToFavourites(
      user,
      business,
    );
    return favourite;
  }

  async getFavouriteByUserId(id: number) {
    const favouriteList: Favourite[] =
      await this.favouriteRepository.getFavouriteByUserId(id);
    return favouriteList;
  }

  async removeFromFavourites(
    favouriteId: string,
    userId: number,
    businessId: string,
  ) {
    return await this.favouriteRepository.removeFromFavourites(
      favouriteId,
      userId,
      businessId,
    );
  }
}
