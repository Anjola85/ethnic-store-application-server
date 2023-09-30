import { BusinessDto } from '../business/dto/business.dto';
import { Business } from '../business/entities/business.entity';
import { User } from '../user/entities/user.entity';
import { Favourite } from './entities/favourite.entity';

export function businessToFavourite(business: Business, user: User): Favourite {
  const favourite = new Favourite();
  favourite.business = business;
  favourite.user = user;
  return favourite;
}

// returns for each favourite: {Business, User}
export function favouriteDtoToFavourite(
  businessDto: BusinessDto[],
  user: User,
): Favourite[] {
  // const businesses: Business[];
  // for each business in BusinessDto, get the corressponding business from the database

  return [new Favourite()];
}
