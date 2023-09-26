import {
  entityToMobile,
  mobileToEntity,
} from 'src/common/mapper/mobile-mapper';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';

export function mapDtoToEntity(authData: CreateAuthDto) {
  const authEntity = new Auth();
  authEntity.email = authData.email;
  authEntity.mobile = mobileToEntity(authData.mobile);
  authEntity.account_verified = authData.accountVerified;
  authEntity.verification_code = authData.verificationCode;
  authEntity.verification_code_expiration = authData.verificationCodeExpiration;
  return authEntity;
}

export function mapAuthToDto(auth: Auth): CreateAuthDto {
  const authDto = new CreateAuthDto();
  authDto.email = auth.email;
  authDto.mobile = entityToMobile(auth.mobile);
  authDto.accountVerified = auth.account_verified;
  authDto.verificationCode = auth.verification_code;
  authDto.verificationCodeExpiration = auth.verification_code_expiration;
  return authDto;
}
