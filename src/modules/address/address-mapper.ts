import { Address } from 'src/modules/address/entities/address.entity';
import { AddressDto } from './dto/address.dto';

export function addressDtoToEntity(address: AddressDto): Address {
  const addressEntity = new Address();

  addressEntity.primary = address.primary;
  addressEntity.unit = address.unit;
  addressEntity.street = address.street;
  addressEntity.city = address.city;
  addressEntity.province = address.province;
  addressEntity.postal_code = address.postalCode;
  addressEntity.country = address.country;
  addressEntity.user = address.user;
  addressEntity.business = address.business;

  return addressEntity;
}

export function entityToAddressDto(address: Address): AddressDto {
  const addressDto = new AddressDto();

  addressDto.primary = address.primary;
  addressDto.unit = address.unit;
  addressDto.street = address.street;
  addressDto.city = address.city;
  addressDto.province = address.province;
  addressDto.postalCode = address.postal_code;
  addressDto.country = address.country;
  addressDto.user = address.user;
  addressDto.business = address.business;

  return addressDto;
}
