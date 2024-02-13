import { RegionReqListDto } from '../../region/region-request.dto';
import {
  CountryReqDto,
  CountryReqListDto,
} from '../country/country-request.dto';

export interface BusinessReqDto {
  // excluded some properties, refer to the CreateBusinessDto for the complete list
  primaryCountry: CountryReqDto;
  countries: CountryReqListDto[];
  regions: RegionReqListDto[];
}
