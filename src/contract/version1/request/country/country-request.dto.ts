export interface CountryReqDto {
  name: string;
  continentId: string;
}

export interface CountryReqListDto {
  countries: CountryReqDto[];
}
