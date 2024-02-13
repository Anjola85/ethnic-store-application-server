import { AddressProcessor } from '../address/address.processor';
import { CountryProcessor } from '../country/country.process';
import { MobileProcessor } from '../mobile/mobile.processor';
import { RegionProcessor } from '../region/region.process';
import {
  BusinessListRespDto,
  BusinessRespDto,
} from './dto/business-response.dto';
import { Business } from './entities/business.entity';

export class BusinessProcessor {
  public static mapEntityToResp(business: Business): BusinessRespDto {
    const resp: BusinessRespDto = {
      id: business.id,
      name: business.name,
      description: business.description,
      address: AddressProcessor.mapEntityToResp(business.address),
      schedule: business.schedule,
      website: business.website,
      primaryCountry: CountryProcessor.mapEntityToResp(business.primaryCountry),
      countries: CountryProcessor.mapEntityListToResp(business.countries),
      regions: RegionProcessor.mapEntityListToResp(business.regions),
      mobile: MobileProcessor.mapEntityToResp(business.mobile),
      businessType: business.businessType,
      rating: business.rating,
      backgroundImage: business.backgroundImage,
      profileImage: business.profileImage,
      createdAt: business.createdAt,
    };
    return resp;
  }

  public static mapEntityListToResp(
    businesses: Business[],
  ): BusinessListRespDto {
    const businessList: BusinessRespDto[] = businesses.map((business) =>
      BusinessProcessor.mapEntityToResp(business),
    );
    const payload: BusinessListRespDto = {
      businessList: businessList,
      size: businessList.length,
    };
    return payload;
  }
}
