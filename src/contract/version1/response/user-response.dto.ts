import { MobileRespDto } from '../request/dto';
import { AddressListRespDto } from './address-response.dto';
import { BusinessListRespDto } from './business-response.dto';
import { CountryRespDto } from './country-response.dto';

/**
 * Response class that deals with the user entity
 */
export interface UserRespDto {
  id: number;
  firstName: string;
  lastName: string;
  userProfile: string;
  dob: string;
  profileImage: string;
  active: boolean;
  country: string;
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
  firstName: string;
  lastName: string;
  userProfile: string;
  dob: string;
  profileImage: string;
  active: boolean;
  country: CountryRespDto;
  email: string;
  mobile: MobileRespDto;
  addressList: AddressListRespDto;
  favouriteList: BusinessListRespDto;
}
