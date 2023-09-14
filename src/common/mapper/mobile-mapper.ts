import { EntityMobileDto, MobileDto } from '../dto/mobile.dto';

export function mobileMapper(mobile: MobileDto): EntityMobileDto {
  const mobileEntity = new EntityMobileDto();

  mobileEntity.phone_number = mobile.phoneNumber || '';
  mobileEntity.country_code = mobile.countryCode || '';
  mobileEntity.iso_code = mobile.isoCode || '';

  return mobileEntity;
}
