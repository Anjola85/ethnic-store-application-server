import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { Country } from './entities/country.entity';

export class CountryProcessor {
  public static mapEntityToResp(country: Country): CountryRespDto {
    const { id, name } = country;
    return { id, name };
  }

  public static mapEntityListToResp(countries: Country[]): CountryListRespDto {
    const countryList: CountryRespDto[] = countries.map((country) =>
      CountryProcessor.mapEntityToResp(country),
    );
    const payload = {
      countryList: countryList,
      size: countryList.length,
    };
    return payload;
  }
}
