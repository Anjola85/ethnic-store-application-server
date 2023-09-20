import { EntityMobileDto, MobileDto } from '../dto/mobile.dto';

export function mobileToEntity(mobile: MobileDto): EntityMobileDto {
  if (!mobile) {
    return null;
  }

  const mobileEntity = new EntityMobileDto();

  mobileEntity.phone_number = mobile?.phoneNumber || '';
  mobileEntity.country_code = mobile?.countryCode || '';
  mobileEntity.iso_code = mobile?.isoCode || '';

  return mobileEntity;
}

export function entityToMobile(mobile: EntityMobileDto): MobileDto {
  if (!mobile) {
    return null;
  }

  const mobileDto = new MobileDto();

  mobileDto.phoneNumber = mobile?.phone_number || '';
  mobileDto.countryCode = mobile?.country_code || '';
  mobileDto.isoCode = mobile?.iso_code || '';

  return mobileDto;
}
