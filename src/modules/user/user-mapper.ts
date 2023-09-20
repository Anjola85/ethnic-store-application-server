import { entityToMobile } from 'src/common/mapper/mobile-mapper';
import { Auth } from '../auth/entities/auth.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './user.enums';
import { entityToAddress } from 'src/common/mapper/address-mapper';

export function mapUserData(userDto: CreateUserDto): User {
  const userEntity = new User();

  userEntity.first_name = userDto.firstName;
  userEntity.last_name = userDto.lastName;
  userEntity.addresses = userDto.addresses;
  userEntity.user_profile = userDto.userProfile || UserProfile.CUSTOMER;
  userEntity.dob = userDto.dob;
  userEntity.profile_image = userDto.profileImageUrl;

  return userEntity;
}

export function mapUserResponse(user: User): UserDto {
  const userDto = new UserDto();
  userDto.firstName = user.first_name;
  userDto.lastName = user.last_name;
  userDto.addresses = user.addresses.map((address) => entityToAddress(address));
  userDto.dob = user.dob;
  userDto.profileImage = user.profile_image;
  userDto.userProfile = user.user_profile;
  return userDto;
}

export function mapAuthToUser(auth: Auth): UserDto {
  if (!auth || !auth.user) return null;

  const userDto = new UserDto();
  userDto.firstName = auth.user.first_name;
  userDto.lastName = auth.user.last_name;
  userDto.addresses = auth.user.addresses.map((address) =>
    entityToAddress(address),
  );
  userDto.dob = auth.user.dob;
  userDto.profileImage = auth.user.profile_image;
  userDto.userProfile = auth.user.user_profile;
  userDto.email = auth.email;
  userDto.mobile = entityToMobile(auth.mobile);
  return userDto;
}
