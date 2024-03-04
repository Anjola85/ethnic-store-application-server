//TODO:  include flags here

// import { ContinentRespDto } from './continent-response.dto';
// import { CountryListRespDto, CountryRespDto } from './country-response.dto';
// import { RegionListRespDto, RegionRespDto } from './region-response.dto';

// export interface RegionInfo {
//   id: number;
//   name: string;
//   countryList: CountryListRespDto;
// }

// export interface RegionInfoList {
//   regionList: RegionInfo[];
//   size: number;
// }

// export interface CountryInfo {
//   id: number;
//   name: string;
//   region: RegionRespDto;
// }

// export interface ContinentInfo {
//   id: number;
//   name: string;
//   regionList: RegionInfoList;
// }

// export interface ContinentInfoList {
//   continentList: ContinentInfo[];
//   size: number;
// }

// export class CountryRegionContinentProcessor {
//   public static mapEntityToResp(
//     country: CountryRespDto,
//     region: RegionInfo,
//     continent: ContinentRespDto,
//   ): CountryRegionContinentRespDto {
//     return {
//       country: {
//         data: country,
//         region: {
//           data: region,
//           continent,
//         },
//       },
//     };
//   }

//   public static mapEntityListToResp(
//     countryList: CountryRegionContinentRespDto[],
//   ): CountryRegionContinentListRespDto {
//     return {
//       countryList,
//       size: countryList.length,
//     };
//   }
// }
