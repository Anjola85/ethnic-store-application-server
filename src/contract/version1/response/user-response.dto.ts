import { AddressListRespDto } from './address-response.dto';
import { BusinessListRespDto } from './business-response.dto';
import { CountryRespDto } from './country-response.dto';
import { MobileRespDto } from './mobile-response.dto';

/**
 * Response class that deals with the user entity
 */
export interface UserRespDto {
  id: number;
  firstname: string;
  lastname: string;
  userProfile: string;
  profileImage: string;
  active: boolean;
  countryOfOrigin: CountryRespDto | null;
  email: string;
  mobile: MobileRespDto | null;
  addressList: AddressListRespDto | null;
  accountVerified: boolean;
}

export interface UserListRespDto {
  userList: UserRespDto[];
}

/**
 * Response class that deals with the user information
 * Consolidates all the information about a user
 */
export interface UserInformationRespDto {
  id: number;
  firstname: string;
  lastname: string;
  userProfile: string;
  profileImage: string;
  active: boolean;
  country: CountryRespDto;
  email: string;
  mobile: MobileRespDto;
  addressList: AddressListRespDto;
  favouriteList: BusinessListRespDto;
  accountVerified: boolean;
}
