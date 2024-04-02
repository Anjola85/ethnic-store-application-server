import { BusinessRespDto } from './business-response.dto';
import { UserRespDto } from './user-response.dto';

export interface FavouriteRespDto {
  id: number;
  business: BusinessRespDto;
  updatedAt: number
}

export interface FavouriteListRespDto {
  result: FavouriteRespDto[];
  size: number;
}
