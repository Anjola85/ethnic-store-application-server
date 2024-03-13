import { FavouriteListRespDto, FavouriteRespDto } from "src/contract/version1/response/favourite-response.dto";
import { BusinessProcessor } from "../business/business.process";
import { Favourite } from "./entities/favourite.entity";

export class FavouriteProcessor {
  public static mapEntityToResp(favourite: Favourite): FavouriteRespDto {
    const { id, business, updatedAt } = favourite;
    return {
      id,
      business: BusinessProcessor.mapEntityToResp(business),
      time: updatedAt,
    };
  }

  public static mapEntityListToResp(
    favourites: Favourite[],
  ): FavouriteListRespDto {
    const favouriteList: FavouriteRespDto[] = favourites
      .map((favourite: Favourite) => FavouriteProcessor.mapEntityToResp(favourite))
      .filter(
        (favouriteResp) =>
          favouriteResp !== null && favouriteResp !== undefined,
      );

    return {
      favouriteList: favouriteList,
      size: favouriteList.length,
    };
  }
}
