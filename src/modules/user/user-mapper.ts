import { entityToMobile } from 'src/common/mapper/mobile-mapper';
import { Auth } from '../auth/entities/auth.entity';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './user.enums';
import {
  addressDtoToEntity,
  entityToAddressDto,
} from 'src/modules/address/address-mapper';
import { UpdateUserDto } from './dto/update-user.dto';

export function userDtoToEntity(userDto: UserDto, userEntity: User): void {
  userEntity.first_name = userDto.firstName;
  userEntity.last_name = userDto.lastName;
  userEntity.addresses = userDto.address.map((addressDto) =>
    addressDtoToEntity(addressDto),
  );
  userEntity.favourites = userDto.favourites;
  userEntity.user_profile = userDto.userProfile || UserProfile.CUSTOMER;
  userEntity.dob = userDto.dob;
  userEntity.profile_image = userDto.profileImageUrl;
}

export function userEntityToDto(user: User): UserDto {
  const userDto = new UserDto();
  userDto.firstName = user.first_name;
  userDto.lastName = user.last_name;
  userDto.address = user.addresses.map((address) =>
    entityToAddressDto(address),
  );
  userDto.favourites = user.favourites;
  userDto.dob = user.dob;
  userDto.profileImageUrl = user.profile_image;
  userDto.userProfile = user.user_profile;
  return userDto;
}

export function mapAuthToUser(auth: Auth): UserDto {
  if (!auth || !auth.user) return null;

  const userDto = new UserDto();
  userDto.firstName = auth.user.first_name;
  userDto.lastName = auth.user.last_name;
  userDto.address = auth.user.addresses.map((address) =>
    entityToAddressDto(address),
  );
  userDto.dob = auth.user.dob;
  userDto.profileImageUrl = auth.user.profile_image;
  userDto.userProfile = auth.user.user_profile;
  userDto.favourites = auth.user?.favourites;
  userDto.email = auth.email;
  userDto.mobile = entityToMobile(auth.mobile);
  return userDto;
}
