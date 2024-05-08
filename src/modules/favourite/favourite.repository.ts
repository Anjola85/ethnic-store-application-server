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
    const favouriteExists = await this.favouriteExist(user.id, business.id);

    if (favouriteExists) {
      throw new ConflictException('Business already favourited');
    }

    const favourite = this.create();
    favourite.user = user;
    favourite.business = business;
    await this.save(favourite);

    return favourite;
  }

  async favouriteExist(userId: number, businessId: number) {
    return await this.createQueryBuilder('favourite')
      .where(
        'favourite.userId = :userId AND favourite.businessId = :businessId',
        {
          userId: userId,
          businessId: businessId,
        },
      )
      .leftJoinAndSelect('favourite.business', 'business')
      .leftJoinAndSelect('business.address', 'address')
      .leftJoinAndSelect('business.mobile', 'mobile')
      .leftJoinAndSelect('business.countries', 'countries')
      .leftJoinAndSelect('business.regions', 'regions')
      .addSelect((subQuery) => {
        return subQuery
          .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
          .from('address', 'address')
          .where('address.id = business.addressId');
      }, 'locationGeoJSON')
      .andWhere('business.id = :id', { id: businessId })
      .getOne();
  }

  async removeFromFavourites(favouriteId: number): Promise<void> {
    try {
      // check if favourite exists for user

      const favourite = await this.createQueryBuilder('favourite')
        .where('favourite.id = :favouriteId', { favouriteId })
        .andWhere('favourite.deleted = false') // Exclude records marked as deleted
        .getOne();

      if (favourite.deleted) favourite.deleted = true;
      await this.save(favourite);
    } catch (error) {
      this.logger.debug(
        'Error thrown in favourite.repository.ts, removeFromFavourites method with error: ' +
          error,
      );
      throw error;
    }
  }

  /**
   *
   * @param id
   * @returns
   */
  async getFavouriteByUserId(id: number): Promise<Favourite[]> {
    try {
      const favourites = await this.createQueryBuilder('favourite')
        .leftJoinAndSelect('favourite.business', 'business')
        .leftJoinAndSelect('favourite.user', 'user')
        .where('userId = :userId', { id })
        .andWhere('favourite.deleted = false') // Exclude records marked as deleted
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
      .andWhere('favourite.deleted = false')
      .getMany();

    return favourites;
  }

  /**
   * Fetches all favourites for a user with business details
   * @param userId
   * @returns
   */
  async getFavouritesWithBusinessDetails(userId: number): Promise<Favourite[]> {
    const favourites: Favourite[] = await this.findFavouritesByUser(userId);

    // fetch the business id for each favourite
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

  /**
   * Gets all favourites including deleted ones
   * @param userId
   * @returns
   */
  async getAllFavouritesByUserId(userId: number): Promise<Favourite[]> {
    try {
      const favourites = await this.createQueryBuilder('favourite')
        .leftJoinAndSelect('favourite.business', 'business')
        .leftJoinAndSelect('favourite.user', 'user')
        .where('userId = :userId', { userId })
        .getMany();
      return favourites;
    } catch (error) {
      this.logger.debug(
        'Error thrown in favourite.repository.ts, getAllFavourites method: ' +
          error +
          ' with error message: ' +
          error.message,
      );
      throw error;
    }
  }
}
