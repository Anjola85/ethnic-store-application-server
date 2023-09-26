import {
  entityToMobile,
  mobileToEntity,
} from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

export function mapDtoToEntity(authData: CreateAuthDto) {
  const authEntity = new Auth();
  authEntity.id = authData.id;
  authEntity.email = authData.email;
  authEntity.mobile = mobileToEntity(authData.mobile);
  authEntity.account_verified = authData.accountVerified;
  authEntity.verification_code = authData.verificationCode;
  authEntity.verification_code_expiration = authData.verificationCodeExpiration;
  authEntity.user = authData.user;
  return authEntity;
}

export function mapAuthToDto(auth: Auth): CreateAuthDto {
  const authDto = new CreateAuthDto();
  authDto.id = auth.id;
  authDto.email = auth.email;
  authDto.mobile = entityToMobile(auth.mobile);
  authDto.accountVerified = auth.account_verified;
  authDto.verificationCode = auth.verification_code;
  authDto.verificationCodeExpiration = auth.verification_code_expiration;
  authDto.user = auth.user;
  return authDto;
}
