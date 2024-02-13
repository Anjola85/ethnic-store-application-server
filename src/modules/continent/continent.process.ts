import {
  ContinentListRespDto,
  ContinentRespDto,
} from 'src/contract/version1/response/continent-response.dto';
import { Continent } from './entities/continent.entity';

export class ContinentProcessor {
  public static mapEntityToResp(continent: Continent): ContinentRespDto {
    const { id, name } = continent;
    return { id, name };
  }

  public static mapEntityListToResp(
    continents: Continent[],
  ): ContinentListRespDto {
    const continentList: ContinentRespDto[] = continents.map((continent) =>
      ContinentProcessor.mapEntityToResp(continent),
    );
    const payload = {
      continentList: continentList,
      size: continentList.length,
    };
    return payload;
  }
}
