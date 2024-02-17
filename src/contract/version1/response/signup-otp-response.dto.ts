import { OtpPayloadResp } from './otp-response.dto';

export interface SignupOtpRespDto extends OtpPayloadResp {
  userExists: boolean;
}
