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
    return await this.favouriteRepository.addToFavourites(user, business);
  }

  async getFavouriteByUserId(id: string) {
    return await this.favouriteRepository.getFavouriteByUserId(id);
  }

  async removeFromFavourites(
    favouriteId: string,
    userId: string,
    businessId: string,
  ) {
    return await this.favouriteRepository.removeFromFavourites(
      favouriteId,
      userId,
      businessId,
    );
  }
}
