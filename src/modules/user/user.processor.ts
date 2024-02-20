/**
 * @see
 * This class handles the conversion of the user contract dto to the user entity or dto class needed for processing
 */
import { Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UserInformationRespDto } from 'src/contract/version1/response/user-response.dto';
import { User } from './entities/user.entity';
import { Mobile } from '../mobile/mobile.entity';
import { MobileRespDto } from 'src/contract/version1/request/dto';
import {
  AddressListRespDto,
  AddressRespDto,
} from 'src/contract/version1/response/address-response.dto';
import {
  BusinessListRespDto,
  BusinessRespDto,
} from 'src/contract/version1/response/business-response.dto';
import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { AddressProcessor } from '../address/address.processor';
import { BusinessProcessor } from '../business/business.process';
import { Favourite } from '../favourite/entities/favourite.entity';
import { Business } from '../business/entities/business.entity';
import { CountryProcessor } from '../country/country.process';

export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);

  constructor() {
    this.logger.log('UserProcessor initialized');
  }

  /**
   * Converts create user dto to user dto
   * @param body
   * @returns
   */
  public static processSignupRequest(body: CreateUserDto): UserDto {
    const userDto = Object.assign(new UserDto(), body);
    return userDto;
  }

  /**
   * This method handles the conversion of the user entity to the user information response dto
   * It maps all user entity relations
   * @param user
   * @param mobile
   * @returns
   */
  public static processUserInfo(
    user: User,
    mobile: Mobile,
  ): UserInformationRespDto {
    const mobileDto: MobileRespDto = Object.assign(new MobileRespDto(), mobile);

    const addressList: AddressListRespDto =
      AddressProcessor.mapEntityListToResp(user.addresses);

    let favouriteBusinessList: BusinessListRespDto;

    if (user.favourites && user.favourites.length > 0) {
      const favouritedBusinessEntities: Business[] = user.favourites.map(
        (favourite: Favourite) => favourite.business,
      );
      favouriteBusinessList = BusinessProcessor.mapEntityListToResp(
        favouritedBusinessEntities,
      );
    } else {
      favouriteBusinessList = {
        businessList: [],
        size: 0,
      };
    }

    let countryDto: CountryRespDto;

    if (user.country)
      countryDto = CountryProcessor.mapEntityToResp(user.country);

    const userInfo: UserInformationRespDto = {
      ...user,
      email: user.auth.email || '',
      mobile: mobileDto,
      addressList,
      favouriteList: favouriteBusinessList,
      country: countryDto,
    };

    console.log('userInfo: ', userInfo);
    return userInfo;
  }
}
