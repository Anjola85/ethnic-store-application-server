export interface RegionRespDto {
  id: number;
  name: string;
}

export interface RegionListRespDto {
  regionList: RegionRespDto[];
  size: number;
}
