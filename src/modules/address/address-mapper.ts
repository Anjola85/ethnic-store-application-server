import { Address } from 'src/modules/address/entities/address.entity';
import { AddressDto } from './dto/address.dto';

export function addressDtoToEntity(address: AddressDto): Address {
  const addressEntity = new Address();
  if (address.id) addressEntity.id = address.id;
  addressEntity.isPrimary = address.primary;
  addressEntity.unit = address.unit;
  addressEntity.street = address.street;
  addressEntity.city = address.city;
  addressEntity.province = address.province;
  addressEntity.postalCode = address.postalCode;
  addressEntity.country = address.country;
  addressEntity.user = address.user;
  addressEntity.business = address.business;
  // addressDto.location = address.location;
  addressEntity.location = `${address.location.coordinates[0]} ${address.location.coordinates[1]}`;

  return addressEntity;
}

export function entityToAddressDto(address: Address): AddressDto {
  const addressDto = new AddressDto();

  addressDto.id = address.id;
  addressDto.primary = address.isPrimary;
  addressDto.unit = address.unit;
  addressDto.street = address.street;
  addressDto.city = address.city;
  addressDto.province = address.province;
  addressDto.postalCode = address.postalCode;
  addressDto.country = address.country;
  addressDto.user = address.user;
  addressDto.business = address.business;
  // addressDto.location = address.location;
  const coordinates = address.location.split(' ');
  addressDto.location = {
    type: 'Point',
    coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])],
  };

  return addressDto;
}
