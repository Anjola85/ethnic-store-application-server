import { MobileRespDto } from 'src/contract/version1/response/mobile-response.dto';
import { Mobile } from './mobile.entity';

export class MobileProcessor {
  public static mapEntityToResp(mobile: Mobile): MobileRespDto {
    if (!mobile) return null;

    const resp: MobileRespDto = {
      id: mobile.id,
      isPrimary: mobile.isPrimary,
      countryCode: mobile.countryCode,
      phoneNumber: mobile.phoneNumber,
      isoType: mobile.isoType,
    };
    return resp;
  }

  public static mapEntityListToResp(mobiles: Mobile[]): MobileRespDto[] {
    return mobiles.map((mobile) => this.mapEntityToResp(mobile));
  }
}
