import { AuthOtppRespDto } from './otp-response.dto';

export interface LoginOtpRespDto extends AuthOtppRespDto {
  userExists: boolean;
}
