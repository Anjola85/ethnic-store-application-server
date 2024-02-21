import { AuthOtppRespDto, OtpRespDto } from './otp-response.dto';

export interface SignupOtpRespDto extends AuthOtppRespDto {
  userExists: boolean;
}
