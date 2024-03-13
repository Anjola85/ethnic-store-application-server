import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { Favourite } from "./entities/favourite.entity";
import { UserService } from "../user/user.service";
import { FavouriteRepository } from "./favourite.repository";
import { User } from "../user/entities/user.entity";
import { Business } from "../business/entities/business.entity";
import { FavouriteListRespDto, FavouriteRespDto } from "src/contract/version1/response/favourite-response.dto";
import { FavouriteProcessor } from "./favourite.process";
import { BusinessService } from "../business/business.service";

@Injectable()
export class FavouriteService {
  private readonly logger = new Logger(FavouriteService.name);
  constructor(
    private favouriteRepository: FavouriteRepository,
    private readonly userService: UserService,
    private readonly  businessService: BusinessService
  ) {}

  async addToFavourites(userId: number, business: Business): Promise<FavouriteRespDto> {
    try {
      const userExists: User = await this.userService.getUserById(userId);
      const businessExists: Business = await this.businessService.getBusinessById(business.id);
      if (!userExists) throw new NotFoundException('User not found');
      if (!businessExists) throw new NotFoundException('Business not found');


      const favouriteExist: Favourite =
        await this.favouriteRepository.favouriteExist(userId, businessExists.id);

      if (
        favouriteExist &&
        favouriteExist.business.id === business.id &&
        !favouriteExist.deleted
      ) {
        // favourite already exists
        return FavouriteProcessor.mapEntityToResp(favouriteExist)
      } else if (favouriteExist && favouriteExist.deleted) {
        // favourite marked as deleted
        favouriteExist.deleted = false;
        await this.favouriteRepository.save(favouriteExist);
        return  FavouriteProcessor.mapEntityToResp(favouriteExist);
      }
      const favourite: Favourite = new Favourite();
      favourite.business = businessExists;
      favourite.user = userExists;

      const newFavourite: Favourite = await this.favouriteRepository.save(favourite);

      return FavouriteProcessor.mapEntityToResp(newFavourite);
    } catch (error) {
      if (error.code === '23503')
        throw new NotFoundException('Business Id to favourite does not exist');


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
      return FavouriteProcessor.mapEntityListToResp(favouriteList);
    } catch (error) {
      this.logger.error(
        'Error thrown in favourite.service.ts, getFavouriteByUserId method, with error: ' +
          error,
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
