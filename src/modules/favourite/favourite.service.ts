import { Injectable } from '@nestjs/common';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Favourite } from './entities/favourite.entity';
import { Model, Types } from 'mongoose';
import { UserService } from '../user/user.service';

@Injectable()
export class FavouriteService {
  // constructor(
  //   @InjectModel(Favourite.name)
  //   private readonly favouriteModel: Model<Favourite>,
  //   private readonly userService: UserService,
  // ) {}
  // /**
  //  * Adds a favourited business with the customer id to the database
  //  * @param createFavouriteDto
  //  * @returns
  //  */
  // async addFavourite(
  //   userId: string,
  //   createFavouriteDto: CreateFavouriteDto,
  // ): Promise<any> {
  //   try {
  //     // check if it exists in DB
  //     const favouriteExists = await this.favouriteModel.findOne({
  //       customerId: createFavouriteDto.customerId,
  //       businessId: createFavouriteDto.businessId,
  //     });
  //     if (favouriteExists !== null && favouriteExists.deleted === false) {
  //       throw new Error('This business has already been favourited');
  //     } else if (favouriteExists !== null && favouriteExists.deleted === true) {
  //       // if it has been favourited before but deleted, then undelete it and favourite it
  //       const undeletedFavourite = await this.favouriteModel.findOneAndUpdate(
  //         {
  //           customerId: createFavouriteDto.customerId,
  //           businessId: createFavouriteDto.businessId,
  //         },
  //         {
  //           deleted: false,
  //         },
  //       );
  //       return undeletedFavourite;
  //     }
  //     let favourite = new this.favouriteModel({ ...createFavouriteDto });
  //     favourite = await favourite.save();
  //     return favourite;
  //   } catch (error) {
  //     throw new Error(
  //       `Error adding new favourite in create method in favourite.service.ts file, error message: ${error.message}`,
  //     );
  //   }
  // }
  // /**
  //  * Returns all favourited businesses by taking in the customer id
  //  * @param id
  //  * @returns
  //  */
  // async getFavourites(customerId: string) {
  //   try {
  //     const favouritedBusinesses = await this.favouriteModel
  //       .find({
  //         customerId: customerId,
  //         deleted: false,
  //       })
  //       .select('-customerId -__v -_id')
  //       .lean();
  //     return favouritedBusinesses;
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving favourite with id ${customerId} from mongo
  //       \nfrom findOne method in favourite.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
  // /**
  //  * Remove the favourited business
  //  * @param id
  //  * @returns
  //  */
  // async removeFavourite(
  //   customerId: string,
  //   businessId: string,
  // ): Promise<boolean> {
  //   try {
  //     const favourite = await this.favouriteModel.findOne({
  //       customerId: customerId,
  //       businessId: businessId,
  //       deleted: false,
  //     });
  //     // if found, set deleted to true
  //     if (favourite) {
  //       favourite.deleted = true;
  //       await favourite.save();
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving favourite with id ${customerId} from mongo
  //       \nfrom findOne method in favourite.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
