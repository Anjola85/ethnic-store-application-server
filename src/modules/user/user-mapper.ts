// import { entityToMobile } from 'src/common/mapper/mobile-mapper';
// import { Auth } from '../auth/entities/auth.entity';
// import { UserDto } from './dto/user.dto';
// import { User } from './entities/user.entity';
// import { UserProfile } from './user.enums';
// import {
//   addressDtoToEntity,
//   entityToAddressDto,
// } from 'src/modules/address/address-mapper';
// import { entityToBusinessDto } from '../business/business-mapper';

// export function userDtoToEntity(userDto: UserDto, userEntity: User): void {
//   userEntity.firstName = userDto.firstName;
//   userEntity.lastName = userDto.lastName;
//   userEntity.addresses = userDto.address.map((addressDto) =>
//     addressDtoToEntity(addressDto),
//   );

//   userEntity.userProfile = userDto.userProfile || UserProfile.CUSTOMER;
//   userEntity.dob = userDto.dob;
//   userEntity.profileImage = userDto.profileImageUrl;
//   userEntity.favourites = []; // favourites is empty on registration
// }

// export function userEntityToDto(user: User): UserDto {
//   const userDto = new UserDto();
//   userDto.firstName = user.firstName;
//   userDto.lastName = user.lastName;
//   userDto.address = user.addresses.map((address) =>
//     entityToAddressDto(address),
//   );

//   userDto.favourites = user.favourites.map((favourite) =>
//     entityToBusinessDto(favourite.business),
//   );

//   userDto.dob = user.dob;
//   userDto.profileImageUrl = user.profileImage;
//   userDto.userProfile = user.userProfile;
//   return userDto;
// }

// export function mapAuthToUser(auth: Auth): UserDto {
//   if (!auth || !auth.user) return null;

//   const userDto = new UserDto();
//   userDto.firstName = auth.user.firstName;
//   userDto.lastName = auth.user.lastName;
//   userDto.address = auth.user.addresses.map((address) =>
//     entityToAddressDto(address),
//   );
//   userDto.dob = auth.user.dob;
//   userDto.profileImageUrl = auth.user.profileImage;
//   userDto.userProfile = auth.user.userProfile;
//   userDto.favourites = auth?.user.favourites.map((favourite) =>
//     entityToBusinessDto(favourite.business),
//   );
//   userDto.email = auth.email;
//   // userDto.mobile = entityToMobile(auth.mobile);
//   userDto.mobile = {
//     isoType: auth.mobile?.isoType || '',
//     phoneNumber: auth.mobile?.phoneNumber || '',
//     countryCode: auth.mobile?.countryCode || '',
//   };
//   return userDto;
// }
