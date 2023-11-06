import { AddressService } from './../address/address.service';
import { InputObject } from './../auth/auth.repository';
import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { AuthService } from '../auth/auth.service';
import { UserFileService } from '../files/user-files.service';
import { mapAuthToUser, userDtoToEntity } from './user-mapper';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';

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

    if (!auth.user || auth.user == null) {
      userExists = false;
    } else {
      userExists = true;
      userModel = auth.user;
    }

    if (!userExists) {
      const address = userDto.address[0];
      address.id = await this.addressService.addAddress(userDto.address[0]);
      userDto.address = [address];

      const newUserEntity = new User();

      if (!userDto.profileImage) {
        // if image provided
        userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
      } else {
        // if image not provided
        userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
          newUserEntity.id,
          userDto.profileImage,
        );
      }

      // map modified field
      userDtoToEntity(userDto, newUserEntity);

      userModel = await this.userRepository.create(newUserEntity).save();

      await this.authService.updateAuthUserId(auth.id, userModel);
      address.user = userModel;
      await this.addressService.updateAddress(address);
    }

    const input: InputObject = { id: auth.id };
    const authObj = await this.authService.getAllUserInfo(input);
    const user: UserDto = mapAuthToUser(authObj); // rename to map user from Auth

    const privateKey = fs.readFileSync('./private_key.pem');
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
    userDtoToEntity(userDto, userEntity);
    const resp = await this.userRepository.updateUser(userEntity);
  }

  /**
   *
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(userDto: UpdateUserDto, authId: string): Promise<void> {
    if (!userDto?.id) throw new Error('User id is required');

    const user = await this.getUserById(userDto.id);

    if (!user) throw new Error('User not found');

    if (userDto.profileImage) {
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        user.id,
        userDto.profileImage,
      );

      this.userRepository.updateUserImageUrl(user.id, userDto.profileImageUrl);
    }

    // update auth account if fields were provided
    if (userDto.email || userDto.mobile) {
      const authDto = new CreateAuthDto();
      authDto.email = userDto.email;
      authDto.mobile = userDto.mobile;
      await this.authService.updateAuthEmailOrMobile(authId, authDto);
    }
  }
}
