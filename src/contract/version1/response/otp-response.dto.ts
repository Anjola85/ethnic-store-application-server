export interface OtpRespDto {
  message: string;
  // token: string;
  code: string;
  expiryTime: number;
}

export interface AuthOtppRespDto extends OtpRespDto {
  token: string;
}
