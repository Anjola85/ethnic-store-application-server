import {
  FavouriteListRespDto,
  FavouriteRespDto,
} from 'src/contract/version1/response/favourite-response.dto';
import { BusinessProcessor } from '../business/business.process';
import { UserProcessor } from '../user/user.processor';
import { Favourite } from './entities/favourite.entity';

export class FavouriteProcessor {
  public static mapEntityToResp(favourite: Favourite): FavouriteRespDto {
    const { id, business, user, updatedAt } = favourite;
    return {
      id,
      business: BusinessProcessor.mapEntityToResp(business),
      // user: UserProcessor.mapEntityToResp(user),
      time: updatedAt,
    };
  }

  public static mapEntityListToResp(
    favourites: Favourite[],
  ): FavouriteListRespDto {
    const favouriteList = favourites.map((favourite) =>
      FavouriteProcessor.mapEntityToResp(favourite),
    );

    const payload = {
      favouriteList: favouriteList,
      size: favouriteList.length,
    };

    return payload;
  }
}
