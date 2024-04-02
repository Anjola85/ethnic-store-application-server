import {
  MobileListRespDto,
  MobileRespDto,
} from 'src/contract/version1/response/mobile-response.dto';
import { Mobile } from './mobile.entity';

export class MobileProcessor {
  public static mapEntityToResp(mobile: Mobile): MobileRespDto {
    if (!mobile) return null;

    return {
      id: mobile.id,
      isPrimary: mobile.isPrimary,
      countryCode: mobile.countryCode,
      phoneNumber: mobile.phoneNumber,
      isoType: mobile.isoType,
    };
  }

  public static mapEntityListToResp(mobile: Mobile[]): MobileListRespDto {
    const out: MobileListRespDto = { size: 0, mobileList: [] };
    if (mobile === undefined || mobile === null || mobile.length === 0)
      return out;

    const mobileList: MobileRespDto[] = mobile
      .map((mobile) => this.mapEntityToResp(mobile))
      .filter((mobileResp) => mobileResp !== null && mobileResp !== undefined);

    return {
      size: mobileList.length,
      mobileList: mobileList,
    };
  }
}
