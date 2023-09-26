import { AddressService } from './../address/address.service';
import { InputObject } from './../auth/auth.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserProfile } from './user.enums';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as fs from 'fs';
import * as jsonwebtoken from 'jsonwebtoken';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from '../address/entities/address.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { Auth } from '../auth/entities/auth.entity';
import { AuthService } from '../auth/auth.service';
import { UserFileService } from '../files/user-files.service';
import { mapAuthToUser, userDtoToEntity } from './user-mapper';
import { UserRepository } from './user.repository';
import { AddressDto } from '../address/dto/address.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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
      address.id = await this.addressService.addUserAddress(userDto.address[0]);
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
  async updateUserInfo(userDto: UserDto): Promise<void> {
    if (!userDto?.id) throw new Error('User id is required');

    const user = await this.getUserById(userDto.id);

    if (!user) throw new Error('User not found');

    // check if image was provided, if so overwrite existing image
    if (userDto.profileImage) {
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        user.id,
        userDto.profileImage,
      );

      // update the user profile image url
      this.updateUser(userDto);
    }

    // update auth account if fields were provided
    const auth = this.authService.updateAuthEmailOrMobile(
      user.id,
      userDto.email,
      userDto.mobile,
    );
  }
}
