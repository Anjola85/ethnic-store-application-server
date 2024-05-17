export interface CountryRespDto {
  id: number;
  name: string;
  imageUrl: string;
}

export interface CountryListRespDto {
  countryList: CountryRespDto[];
  size: number;
}

export interface CountryWithRegion {
  id: number;
  name: string;
  region: string;
}

export interface CountryListWithRegion {
  countryList: CountryWithRegion[];
  size: number;
}
