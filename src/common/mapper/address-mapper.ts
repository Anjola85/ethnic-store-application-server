import {
  Address,
  AddressEntity,
} from 'src/modules/user/entities/address.entity';
import { AddressDto } from '../dto/address.dto';

export function addressToEntity(address: AddressDto): AddressEntity {
  const addressEntity: AddressEntity = {
    primary: address.primary,
    unit: address.unit,
    street: address.street,
    city: address.city,
    province: address.province,
    postal_code: address.postalCode,
    country: address.country,
  };

  return addressEntity;
}

export function entityToAddress(address: AddressEntity) {
  const addressDto: AddressDto = {
    primary: address.primary,
    unit: address.unit,
    street: address.street,
    city: address.city,
    province: address.province,
    postalCode: address.postal_code,
    country: address.country,
  };

  return addressDto;
}
