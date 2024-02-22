import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Favourite } from './entities/favourite.entity';
import { User } from '../user/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessRepository } from '../business/business.repository';

@Injectable()
export class FavouriteRepository extends Repository<Favourite> {
  private readonly logger = new Logger('FavouriteRepository');

  constructor(
    private dataSource: DataSource,
    private businessRepository: BusinessRepository,
  ) {
    super(Favourite, dataSource.createEntityManager());
  }

  async addToFavourites(user: User, business: Business): Promise<Favourite> {
    const favouriteExists = await this.createQueryBuilder('favourite')
      .where(
        'favourite.userId = :userId AND favourite.businessId = :businessId',
        {
          userId: user.id,
          businessId: business.id,
        },
      )
      .getOne();

    if (favouriteExists) {
      throw new ConflictException('Business already favourited');
    }

    const favourite = this.create();
    favourite.user = user;
    favourite.business = business;
    await this.save(favourite);

    return favourite;
  }

  async removeFromFavourites(
    favouriteId: string,
    userId: number,
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
          'favourite.userId = :userId AND favourite.business.id = :businessId',
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

  async getFavouriteByUserId(id: number): Promise<Favourite[]> {
    try {
      const favourites = await this.createQueryBuilder('favourite')
        .leftJoinAndSelect('favourite.business', 'business')
        .leftJoinAndSelect('favourite.user', 'user')
        .where('userId = :userId', { id })
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

  /**
   * Fetches all favourites for a user
   * @param userId
   * @returns
   */
  async findFavouritesByUser(userId: number): Promise<Favourite[]> {
    const favourites = await this.createQueryBuilder('favourite')
      .leftJoinAndSelect('favourite.business', 'business')
      .leftJoinAndSelect('favourite.user', 'user')
      .where('favourite.userId = :userId', { userId })
      .getMany();

    return favourites;
  }

  /**
   * Fetches all favourites for a user with business details
   * @param userId
   * @returns
   */
  async getFavouritesWithBusinessDetails(userId: number): Promise<Favourite[]> {
    const favourites = await this.findFavouritesByUser(userId);

    // fetch the the business id for each favourite
    const businessIdList: number[] = favourites.map(
      (favourite) => favourite.business.id,
    );

    const businesses: Business[] =
      await this.businessRepository.getRelationsByBusinessId(businessIdList);

    // for each business returned, attach it to the favourite
    favourites.forEach((favourite) => {
      businesses.forEach((business) => {
        if (favourite.business.id === business.id) {
          favourite.business = business;
        }
      });
    });

    return favourites;
  }
}
