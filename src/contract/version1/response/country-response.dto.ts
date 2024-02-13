export interface CountryRespDto {
  id: number;
  name: string;
}

export interface CountryListRespDto {
  countryList: CountryRespDto[];
  size: number;
}
