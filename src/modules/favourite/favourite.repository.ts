import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Favourite } from './entities/favourite.entity';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class FavouriteRepository extends Repository<Favourite> {
  private readonly logger = new Logger('FavouriteRepository');

  constructor(private dataSource: DataSource) {
    super(Favourite, dataSource.createEntityManager());
  }

  async getFavouriteByUserId(id: string): Promise<Favourite[]> {
    try {
      const favourites = await this.createQueryBuilder('favourite')
        .leftJoinAndSelect('favourite.business', 'business')
        .leftJoinAndSelect('favourite.user', 'user')
        .where('user.id = :id', { id })
        .getMany();
      return favourites || null;
    } catch (error) {
      this.logger.debug(
        'Error thrown in favourite.repository.ts, getFavouriteByUserId method: ' +
          error +
          ' with error message: ' +
          error.message,
      );
      throw new HttpException(
        "Unable to retrieve user's favourites from the database",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async addToFavourites(user: User, business: Business): Promise<Favourite[]> {
    const favouriteExists = await this.createQueryBuilder('favourite').where(
      'favourite.user = :user AND favourite.business = :business',
      { user, business },
    );

    if (!favouriteExists) {
      const favourite = new Favourite();
      favourite.user = user;
      favourite.business = business;
      await favourite.save();
    }

    const allFavourites = await this.getFavouriteByUserId(user.id);
    return allFavourites;
  }

  async removeFromFavourites(
    favouriteId: string,
    userId: string,
    businessId: string,
  ): Promise<Favourite[]> {
    let favourite;
    if (favouriteId) {
      favourite = await this.createQueryBuilder('favourite')
        .where('favourite.id = :favouriteId', { favouriteId })
        .getOne();
    } else {
      favourite = await this.createQueryBuilder('favourite')
        .where(
          'favourite.user.id = :userId AND favourite.business.id = :businessId',
          {
            userId,
            businessId,
          },
        )
        .getOne();
    }
    (await favourite.remove()).save();

    const allFavourites = await this.getFavouriteByUserId(userId);
    return allFavourites;
  }
}
