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
    if (regions === undefined || regions === null || regions.length === 0)
      return {size: 0, regionList: []}

    const regionList: RegionRespDto[] = regions.map((region) =>
      RegionProcessor.mapEntityToResp(region),
    );

    return {
      regionList: regionList,
      size: regionList.length,
    };
  }
}
