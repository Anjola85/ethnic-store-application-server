import { ContinentRespDto } from './continent-response.dto';
import { CountryRespDto } from './country-response.dto';
import { RegionRespDto } from './region-response.dto';
import { Country } from "../../../modules/country/entities/country.entity";
import { Region } from "../../../modules/region/entities/region.entity";
import { Continent } from "../../../modules/continent/entities/continent.entity";

// Define interfaces for the structured data that will be sent to the frontend.
export interface CountryInfo {
  id: number;
  name: string;
}

export interface RegionInfo {
  id: number;
  name: string;
}

export interface ContinentInfo {
  id: number;
  name: string;
}

// Define the interface for the combined data structure.
export interface CountryRegionContinentInfo {
  countryInfo: CountryInfo;
  regionInfo: RegionInfo;
  continentInfo: ContinentInfo;
}

// Define the list structure for the combined data.
export interface CountryRegionContinentInfoList {
  data: CountryRegionContinentInfo[];
  size: number;
}

// Processor class to map entities to the response DTOs.
export class CountryRegionContinentProcessor {
  // Map a single set of entities to the combined DTO.
  public static mapToCountryRegionContinentInfo(
    country: Country,
    region: Region,
    continent: Continent
  ): CountryRegionContinentInfo {
    return {
      countryInfo: {
        id: country.id,
        name: country.name,
      },
      regionInfo: {
        id: region.id,
        name: region.name,
      },
      continentInfo: {
        id: continent.id,
        name: continent.name,
      },
    };
  }

  // Map a list of combined entities to the list DTO.
  public static mapToCountryRegionContinentInfoList(
    dataList: CountryRegionContinentInfo[]
  ): CountryRegionContinentInfoList {
    return {
      data: dataList,
      size: dataList.length,
    };
  }
}
