import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { Country } from './entities/country.entity';

export class CountryProcessor {
  public static mapEntityToResp(country: Country): CountryRespDto {
    const { id, name, imageUrl } = country;
    return { id, name, imageUrl };
  }

  public static mapEntityListToResp(countries: Country[]): CountryListRespDto {
    if (countries === undefined || countries === null || countries.length === 0)
      return { size: 0, countryList: [] };

    const countryList: CountryRespDto[] = countries
      .map((country) => CountryProcessor.mapEntityToResp(country))
      .filter(
        (countryResp) => countryResp !== null && countryResp !== undefined,
      );

    const payload = {
      countryList: countryList,
      size: countryList.length,
    };
    return payload;
  }
}
