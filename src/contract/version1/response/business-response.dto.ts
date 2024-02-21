import { AddressRespDto } from './address-response.dto';
import { CountryListRespDto, CountryRespDto } from './country-response.dto';
import { MobileRespDto } from './mobile-response.dto';
import { RegionListRespDto } from './region-response.dto';
import { ScheduleRespDto } from './schedule-response.dto';

export interface BusinessRespDto {
  id: number;
  name: string;
  description: string;
  address: AddressRespDto;
  email?: string;
  mobile: MobileRespDto;
  schedule: ScheduleRespDto;
  website: string;
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
