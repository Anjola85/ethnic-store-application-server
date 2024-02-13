import { CreateAuthDto } from './dto/create-auth.dto';
import { Auth } from './entities/auth.entity';
import { Mobile } from '../mobile/mobile.entity';

export function mapDtoToEntity(authData: CreateAuthDto) {
  const authEntity = new Auth();
  authEntity.id = authData.id;
  authEntity.email = authData.email || '';

  if (authData.mobile) {
    authEntity.mobile = new Mobile();
    authEntity.mobile.phoneNumber = authData.mobile.phoneNumber;
    authEntity.mobile.countryCode = authData.mobile.countryCode;
    authEntity.mobile.isoType = authData.mobile.isoType;
  }

  authEntity.accountVerified = authData.accountVerified;
  authEntity.otpCode = authData.otpCode;
  authEntity.otpExpiry = authData.otpExpiry;
  authEntity.user = authData.user;
  return authEntity;
}

// export function mapAuthToDto(auth: Auth): CreateAuthDto {
//   const authDto = new CreateAuthDto();
//   authDto.id = auth.id;
//   authDto.email = auth.email;
//   authDto.mobile = entityToMobile(auth.mobile);
//   authDto.accountVerified = auth.account_verified;
//   authDto.otpCode = auth.verification_code;
//   authDto.otpExpiry = auth.verification_code_expiration;
//   authDto.user = auth.user;
//   return authDto;
// }
