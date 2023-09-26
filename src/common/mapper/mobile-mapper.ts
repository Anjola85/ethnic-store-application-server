import { EntityMobileDto, MobileDto } from '../dto/mobile.dto';

export function mobileToEntity(mobile: MobileDto): EntityMobileDto {
  if (!mobile) {
    return null;
  }

  const mobileEntity = new EntityMobileDto();

  mobileEntity.phone_number = mobile?.phoneNumber || '';
  mobileEntity.country_code = mobile?.countryCode || '';
  mobileEntity.iso_type = mobile?.isoType || '';

  return mobileEntity;
}

export function entityToMobile(mobile: EntityMobileDto): MobileDto {
  if (!mobile) {
    return null;
  }

  const mobileDto = new MobileDto();

  mobileDto.phoneNumber = mobile?.phone_number || '';
  mobileDto.countryCode = mobile?.country_code || '';
  mobileDto.isoType = mobile?.iso_type || '';

  return mobileDto;
}
