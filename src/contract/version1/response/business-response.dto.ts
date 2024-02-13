import { AddressRespDto } from './address-response.dto';
import { MobileRespDto } from './mobile-response.dto';
import { ScheduleRespDto } from './schedule-response.dto';

export interface businessPayloadResp {
  id: string;
  name: string;
  description: string;
  address: AddressRespDto;
  email?: string;
  mobile: MobileRespDto;
  schedule: ScheduleRespDto;
  website: string;
  country: string;
  countries: string[];
  regions: string[];
  businessType: string;
  rating: string;
  backgroundImage: string;
  profileImage: string;
  createdAt: string;
}
