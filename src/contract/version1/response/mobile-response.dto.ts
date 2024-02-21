export interface MobileRespDto {
  id: number;
  isPrimary: boolean;
  countryCode: string;
  phoneNumber: string;
  isoType: string;
}

export interface MobileListRespDto {
  mobileList: MobileRespDto[];
  size: number;
}
