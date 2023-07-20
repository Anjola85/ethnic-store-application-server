import { Injectable } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Favourite } from './entities/favourite.entity';
import { Model } from 'mongoose';

@Injectable()
export class FavouriteService {
  constructor(
    @InjectModel(Favourite.name)
    private readonly favouriteModel: Model<Favourite>,
  ) {}

  /**
   * Adds a favourited business with the customer id to the database
   * @param createFavouriteDto
   * @returns
   */
  async addFavourite(createFavouriteDto: CreateFavouriteDto): Promise<any> {
    try {
      let favourite = new this.favouriteModel({ ...createFavouriteDto });
      favourite = await favourite.save();
      return favourite;
    } catch (error) {
      throw new Error(
        `Error adding new favourite in create method in favourite.service.ts file\n
          error message: ${error.message}`,
      );
    }
  }

  /**
   * Returns all favourited businesses by taking in the customer id
   * @param id
   * @returns
   */
  async getFavourites(custId: string) {
    try {
      const favouritedBusinesses = await this.favouriteModel.find({
        customerId: { $in: custId },
        deleted: false,
      });
      return favouritedBusinesses;
    } catch (error) {
      throw new Error(
        `Error retrieving favourite with id ${custId} from mongo 
        \nfrom findOne method in favourite.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Remove the favourited business
   * @param id
   * @returns
   */
  async removeFavourite(custId: string, businessId: string): Promise<any> {
    try {
      const favourite = await this.favouriteModel.findOne({
        customerId: { $in: custId },
        businessId: { $in: businessId },
        deleted: true,
      });
      return favourite;
    } catch (error) {
      throw new Error(
        `Error retrieving favourite with id ${custId} from mongo 
        \nfrom findOne method in favourite.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }
}
