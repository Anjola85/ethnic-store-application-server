export interface RegionReqDto {
  name: string;
  continentId: string;
}

export interface RegionReqListDto {
  regions: RegionReqDto[];
}
