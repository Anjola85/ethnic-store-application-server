export interface RegionRespDto {
  id: number;
  name: string;
  imageUrl: string;
}

export interface RegionListRespDto {
  regionList: RegionRespDto[];
  size: number;
}
