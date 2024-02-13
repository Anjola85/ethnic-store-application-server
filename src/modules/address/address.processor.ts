import { AddressRespDto } from 'src/contract/version1/response/address-response.dto';
import { Address } from './entities/address.entity';

export class AddressProcessor {
  public static mapEntityToResp(address: Address): AddressRespDto {
    const resp: AddressRespDto = {
      id: address.id,
      isPrimary: address.isPrimary,
      unit: address.unit,
      street: address.street,
      city: address.city,
      province: address.province,
      postalCode: address.postalCode,
      country: address.country,
      //TOOD: fix below
      latitude: 222,
      longitude: 222,
    };
    return resp;
  }
}
