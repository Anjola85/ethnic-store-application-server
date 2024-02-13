import { MobileResponseDto } from 'src/common/dto/mobile-response';
import { ScheduleRespDto } from './schedule-response.dto';
import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { AddressRespDto } from 'src/contract/version1/response/address-response.dto';
import { RegionListRespDto } from 'src/contract/version1/response/region-response.dto';
import { MobileRespDto } from 'src/contract/version1/response/mobile-response.dto';

export interface BusinessRespDto {
  id: number;
  name: string;
  description: string;
  address: AddressRespDto;
  email?: string;
  mobile?: MobileRespDto;
  schedule: ScheduleRespDto;
  website: string;
  primaryCountry: CountryRespDto;
  countries: CountryListRespDto;
  regions: RegionListRespDto;
  businessType: string;
  rating: string;
  backgroundImage: string;
  profileImage: string;
  createdAt: number;
}

export interface BusinessListRespDto {
  businessList: BusinessRespDto[];
  size: number;
}
