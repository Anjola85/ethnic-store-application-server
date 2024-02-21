import { UserInformationRespDto } from './user-response.dto';

export interface SignupRespDto {
  token: string;
  userInfo: UserInformationRespDto;
}
