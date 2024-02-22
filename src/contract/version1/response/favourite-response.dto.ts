import { BusinessRespDto } from './business-response.dto';
import { UserRespDto } from './user-response.dto';

export interface FavouriteRespDto {
  id: number;
  business: BusinessRespDto;
  // user: UserRespDto;
  time: number; // represents updatedAt - in order to display the time the favourite was added, note this changes as user can unfavourite and favourite again, business logic follows soft delete
}

export interface FavouriteListRespDto {
  favouriteList: FavouriteRespDto[];
  size: number;
}
