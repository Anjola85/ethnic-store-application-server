import { mobileMapper } from 'src/common/mapper/mobile-mapper';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Address } from '../user/entities/address.entity';

export function mapBusinessData(
  businessData: CreateBusinessDto,
  address: Address,
) {
  const businessEntity = new Business();
  businessEntity.user = businessData.user;
  businessEntity.country = businessData.country;
  businessEntity.other_countries = businessData.otherCountries;
  businessEntity.categories = businessData.categories;
  businessEntity.name = businessData.name;
  businessEntity.description = businessData.description;
  businessEntity.address = address;
  businessEntity.email = businessData.email;
  businessEntity.schedule = businessData.schedule;
  businessEntity.website = businessData.website;
  businessEntity.rating = businessData.rating;
  businessEntity.mobile = {
    primary: mobileMapper(businessData.mobile.primary),
    secondary: mobileMapper(businessData.mobile.secondary),
  };
  businessEntity.navigation_url = businessData.navigationUrl;
  businessEntity.geolocation = businessData.geolocation;
  businessEntity.business_type = businessData.businessType;
  return businessEntity;
}
