import { AddressService } from './../address/address.service';
import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service';
import { UserFileService } from '../files/user-files.service';
// import { mapAuthToUser, userDtoToEntity } from './user-mapper';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';
import { AddressDto } from '../address/dto/address.dto';
import { compareMobiles } from 'src/common/util/mobileUtil';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { entityToMobile } from 'src/common/mapper/mobile-mapper';
import { AuthParams } from '../auth/entities/auth.entity';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private addressService: AddressService,
    private authService: AuthService,
    private userFileService: UserFileService,
  ) {}

  async create(userDto: UserDto): Promise<any> {
    let userModel: User;
    let userExists: boolean;

    const auth = await this.authService.findByEmailOrMobile(
      userDto.email,
      userDto.mobile,
    );

    if (!auth.user) {
      userExists = false;
    } else {
      userExists = true;
      userModel = auth.user;

      let existingMobile: {
        phoneNumber: string;
        isoType: string;
        countryCode: string;
      };

      if (userDto.mobile && auth.mobile) {
        existingMobile = {
          phoneNumber: auth.mobile.phoneNumber,
          isoType: auth.mobile.isoType,
          countryCode: auth.mobile.countryCode,
        };
      }

      // const existingMobile =
      //   userDto.mobile && auth.mobile ? entityToMobile(auth.mobile) : null;

      if (userDto.email == auth.email) throw new Error('Email already exists');
      else if (compareMobiles(userDto.mobile, existingMobile))
        throw new Error('Mobile already exists');
    }

    const address: AddressDto = userDto.address[0];
    address.primary = true;
    address.id = await this.addressService.addAddress(address);
    userDto.address = [address];

    const newUserEntity = new User();

    // generate random avatar
    if (!userDto.profileImage)
      userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
    else
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        newUserEntity.id,
        userDto.profileImage,
      );

    // map modified field
    // userDtoToEntity(userDto, newUserEntity);

    // add new user to db
    userModel = await this.userRepository.create(newUserEntity).save();

    // update auth with reference to user
    await this.authService.updateAuthUserId(auth.id, userModel);

    // update address with reference to user
    address.user = userModel;
    await this.addressService.updateAddress(address);

    const input: AuthParams = { authId: auth.id };
    const authObj = await this.authService.getAllUserInfo(input);
    // const user: UserDto = mapAuthToUser(authObj); // rename to map user from Auth
    const user = null;

    const privateKey = fs.readFileSync('./secrets/private_key.pem');
    const token = jsonwebtoken.sign(
      { id: userModel.id },
      privateKey.toString(),
      {
        expiresIn: '1d',
      },
    );

    return { token, user, userExists };
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }

  /**
   *
   * @param userDto
   * @returns the updated user info
   */
  async updateUser(userDto: UserDto): Promise<void> {
    const userEntity = new User();
    // userDtoToEntity(userDto, userEntity);
    const resp = await this.userRepository.updateUser(userEntity);
  }

  /**
   * This should check for what input fields has been provided and do the necessary update
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(userDto: UpdateUserDto, authId: string): Promise<void> {
    const user = await this.getUserById(userDto.id);

    if (!user) throw new Error('User not found');

    // check if profile image was provided and upload it
    if (userDto.profileImage) {
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        user.id,
        userDto.profileImage,
      );

      this.userRepository.updateUserImageUrl(user.id, userDto.profileImageUrl);
    }

    // update user account
    if (userDto.firstName || userDto.lastName) {
      if (userDto.firstName) user.firstName = userDto.firstName;
      if (userDto.lastName) user.lastName = userDto.lastName;

      this.userRepository.updateUser(user);
    }

    // update auth account if fields were provided
    if (userDto.email || userDto.mobile) {
      const authDto = new CreateAuthDto();
      if (userDto.email) authDto.email = userDto.email;
      if (userDto.mobile) authDto.mobile = userDto.mobile;
      await this.authService.updateAuthEmailOrMobile(authId, authDto);
    }

    // update address
    if (userDto.address) this.addressService.updateAddress(userDto.address);
  }
}
