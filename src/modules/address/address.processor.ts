import { AddressListRespDto, AddressRespDto } from "src/contract/version1/response/address-response.dto";
import { Address } from "./entities/address.entity";

export class AddressProcessor {
  public static mapEntityToResp(address: Address): AddressRespDto {
    if (!address || !address.id)
      return null;

    console.log("location: ",  JSON.stringify(address.location, null, 2))
    const location = address.location as any; // as GeoJSONPoint;
    const longitude: number = location?.coordinates[0];
    const latitude: number = location?.coordinates[1];
    return {
      id: address.id,
      isPrimary: address.isPrimary,
      unit: address.unit,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      updatedAt: address.updatedAt,
      country: address.country,
      latitude,
      longitude,
    };
  }

  public static mapEntityListToResp(addresses: Address[]): AddressListRespDto {
    if (addresses === undefined || addresses === null || addresses.length === 0)
      return { size: 0, addressList: [] };

    const addressList: AddressRespDto[] = addresses
      .map((address) => this.mapEntityToResp(address))
      .filter(
        (addressResp) => addressResp !== null && addressResp !== undefined,
      );

    return {
      addressList: addressList,
      size: addressList.length,
    };
  }
}

export interface Location {
  x: number;
  y: number;
}
