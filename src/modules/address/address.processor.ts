import { AddressRespDto } from 'src/contract/version1/response/address-response.dto';
import { Address } from './entities/address.entity';

export class AddressProcessor {
  public static mapEntityToResp(address: Address): AddressRespDto {
    const location = address.location as unknown as Location;
    const resp: AddressRespDto = {
      id: address.id,
      isPrimary: address.isPrimary,
      unit: address.unit,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      latitude: location.x,
      longitude: location.y,
    };
    return resp;
  }

  public static mapEntityListToResp(addresses: Address[]): AddressRespDto[] {
    return addresses.map((address) => this.mapEntityToResp(address));
  }
}

export interface Location {
  x: number;
  y: number;
}
