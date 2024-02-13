export interface ContinentRespDto {
  id: number;
  name: string;
}

export interface ContinentListRespDto {
  continentList: ContinentRespDto[];
  size: number;
}
