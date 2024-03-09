import {
  AddressListRespDto,
  AddressRespDto,
} from 'src/contract/version1/response/address-response.dto';
import { Address } from './entities/address.entity';

export class AddressProcessor {
  public static mapEntityToResp(address: Address): AddressRespDto {
    const location = address.location as any; // as GeoJSONPoint;
    const longitude: number = location?.coordinates[0];
    const latitude: number = location?.coordinates[1];
    const resp: AddressRespDto = {
      id: address.id,
      isPrimary: address.isPrimary,
      unit: address.unit,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      latitude,
      longitude,
    };
    return resp;
  }

  public static mapEntityListToResp(addresses: Address[]): AddressListRespDto {
    const addressList = addresses.map((address) =>
      this.mapEntityToResp(address),
    );
    const payload: AddressListRespDto = {
      addressList: addressList,
      size: addressList.length,
    };
    return payload;
  }
}

export interface Location {
  x: number;
  y: number;
}
