import { mobileMapper } from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

export function mapDtoToEntity(authData: CreateAuthDto) {
  const authEntity = new Auth();
  authEntity.email = authData.email;
  authEntity.mobile = mobileMapper(authData.mobile);
  authEntity.account_verified = authData.accountVerified;
  authEntity.verification_code = authData.verificationCode;
  authEntity.verification_code_expiration = authData.verificationCodeExpiration;
  //authEntity.user = authData.user;
  return authEntity;
}
