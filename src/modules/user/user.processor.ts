import { MobileRespDto } from 'src/contract/version1/response/mobile-response.dto';
/**
 * @see
 * This class handles the conversion of the user contract dto to the user entity or dto class needed for processing
 */
import { Logger } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import {
  UserInformationRespDto,
  UserRespDto,
} from 'src/contract/version1/response/user-response.dto';
import { User } from './entities/user.entity';
import { Mobile } from '../mobile/mobile.entity';
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
import { MobileDto } from 'src/common/dto/mobile.dto';
import { MobileProcessor } from '../mobile/mobile.processor';

export class UserProcessor {
  private static readonly logger = new Logger(UserProcessor.name);

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
   * relations include: mobile, address, favourite, country
   * @param user - includes all user entity relations
   * @param mobile - includes just the mobile entity
   * @returns
   */
  public static processUserRelationInfo(
    user: User,
    mobile: Mobile,
  ): UserInformationRespDto {
    if (!user || !mobile) {
      this.logger.error(
        'User and mobile cannot be null in method processUserRelationInfo and file user.processor.ts',
      );
      throw new Error(
        'User and mobile cannot be null in method processUserRelationInfo and file user.processor.ts',
      );
    }

    const mobileDto: MobileRespDto = MobileProcessor.mapEntityToResp(mobile);

    let addressList: AddressListRespDto;

    if (user.addresses)
      addressList = AddressProcessor.mapEntityListToResp(user.addresses);

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

    if (user.countryOfOrigin)
      countryDto = CountryProcessor.mapEntityToResp(user.countryOfOrigin);

    const userInfo: UserInformationRespDto = {
      id: user.id,
      firstname: user.firstname,
      lastname: user.lastname,
      userProfile: user.userProfile,
      profileImage: user?.profileImage || '',
      active: user.active,
      email: user.auth?.email || '',
      mobile: mobileDto,
      addressList: addressList || null,
      favouriteList: favouriteBusinessList,
      country: countryDto,
      accountVerified: user.auth?.accountVerified || false,
    };

    return userInfo;
  }

  /**
   * This method handles the conversion of the user entity to the user response dto
   * it maps all user entity relations except FAVOURITES
   * @param user
   * @param mobile
   * @returns
   */
  public static mapEntityToResp(user: User): UserRespDto {
    try {
      if (!user && !user.auth) {
        throw new Error(
          'User not found - user and user.auth cannot be null - processUserInfo - user.processor.ts',
        );
      }

      let mobileDto: MobileRespDto;
      let email = '';

      if (user.auth.mobile) {
        mobileDto = MobileProcessor.mapEntityToResp(user.auth.mobile);
      }
      if (user.auth.email) {
        email = user.auth.email;
      }

      let addressList: AddressListRespDto;
      if (user.addresses) {
        addressList = AddressProcessor.mapEntityListToResp(user.addresses);
      }

      let countryDto: CountryRespDto;

      if (user.countryOfOrigin)
        countryDto = CountryProcessor.mapEntityToResp(user.countryOfOrigin);

      const userInfo: UserRespDto = {
        id: user.id,
        firstname: user.firstname,
        lastname: user.lastname,
        userProfile: user.userProfile,
        profileImage: user.profileImage || '',
        active: user.active,
        email: email,
        mobile: mobileDto || null,
        addressList: addressList || null,
        countryOfOrigin: countryDto || null,
        accountVerified: user.auth.accountVerified || false,
      };

      return userInfo;
    } catch (error) {
      this.logger.error(
        'Error mapping user entity to response with error: ' + error,
      );
    }
  }
}
