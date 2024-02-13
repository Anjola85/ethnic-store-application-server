import {
  RegionListRespDto,
  RegionRespDto,
} from 'src/contract/version1/response/region-response.dto';
import { Region } from './entities/region.entity';

export class RegionProcessor {
  public static mapEntityToResp(region: Region): RegionRespDto {
    const { id, name } = region;
    return { id, name };
  }

  public static mapEntityListToResp(regions: Region[]): RegionListRespDto {
    const regionList: RegionRespDto[] = regions.map((region) =>
      RegionProcessor.mapEntityToResp(region),
    );
    const payload = {
      regionList: regionList,
      size: regionList.length,
    };
    return payload;
  }
}
