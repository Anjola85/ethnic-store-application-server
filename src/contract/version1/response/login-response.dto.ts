import { UserInformationRespDto } from './user-response.dto';

export interface LoginRespDto {
  userInfo: UserInformationRespDto;
  token: string;
}
