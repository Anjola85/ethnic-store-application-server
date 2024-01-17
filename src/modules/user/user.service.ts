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
import { MobileService } from '../mobile/mobile.service';
import { Mobile } from '../mobile/mobile.entity';
import { Address } from '../address/entities/address.entity';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private addressService: AddressService,
    private mobileService: MobileService,
    private authService: AuthService,
    private userFileService: UserFileService,
  ) {}

  async register(userDto: UserDto): Promise<any> {
    let userModel: User;
    let userExists: boolean;

    // if mobile provided, check if mobile exists
    if (userDto.mobile) {
      const mobile = new Mobile();
      Object.assign(mobile, userDto.mobile);
      // check if mobile exists
      const mobileExist = this.mobileService.getMobile(mobile);
      if (mobileExist) {
        console.log('mobile exists, checking if user exists');
        // check if auth exists on mobile (and if it does, check if a user is associated with it)
        if (mobile.auth && mobile.auth.user) {
          // user exists
          userExists = true;
          userModel = mobile.auth.user;

          console.log(
            'user already registered,  pulling user info: ' + userModel,
          );
        } else if (mobile.auth && !mobile.auth.user) {
          console.log(`mobile exists without user, this is the expected case`);

          // user does not exist, so register user and map it with existing auth
          userExists = false;

          // map auth to user
          userDto.auth = mobile.auth;

          // create user
          userModel = await this.addUser(userDto);

          // update auth with reference to user
          await this.authService.updateAuthUserId(mobile.auth.id, userModel);

          console.log(
            'user does not exist during signup, creating user: ' + userModel,
          );
        } else {
          // THIS SHOULD NEVER HAPPEN
          console.log(
            "mobile doesnt have auth, shouldn't happen, if verifyOTP was called before signup",
          );

          // mobile does not have auth, so create auth and associate with user
          userExists = false;

          throw new Error(
            'Mobile exists without auth and user, this SHOULD NEVER HAPPEN, sendOTP should be called before this',
          );
        }
      } else {
        // THIS SHOULD NEVER HAPPEN. SENDOTP should be called before this SIGN UP
        console.log(
          "mobile doesn't exist, shouldn't happen, if sendOTP was called before signup",
        );

        // mobile does not exist, so create mobile, auth and user
        userExists = false;

        throw new Error(
          'Mobile, auth and user do not exist, this SHOULD NEVER HAPPEN, sendOTP should be called before this',
        );
      }
    } else if (userDto.email) {
      // mobile not provided, so check if email exists
      const auth = await this.authService.findByEmail(userDto.email);

      if (auth) {
        // if email exists, check if auth has user
        if (auth.user) {
          // if user exists, return user
          userExists = true;
          userModel = auth.user;
        } else {
          // if user does not exist, create user and associate with auth
          userExists = false;

          // create user
          userDto.auth = auth;
          userModel = await this.addUser(userDto);

          // update auth with reference to user
          await this.authService.updateAuthUserId(auth.id, userModel);
        }
      } else {
        // email, auth and user do not exist, so create auth and user?
        throw new Error(
          'Email, auth and user do not exist, this SHOULD NEVER HAPPEN, verifyOTP/sendOTP should be called before this',
        );
      }
    } else {
      // email or phone wasnt provided
      throw new Error('Email or phone number is required');
    }

    // generate random avatar
    // if (!userDto.profileImage)
    //   userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
    // else
    //   userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
    //     newUserEntity.id,
    //     userDto.profileImage,
    //   );

    const privateKey = fs.readFileSync('./secrets/private_key.pem');
    const token = jsonwebtoken.sign(
      { id: userModel.id },
      privateKey.toString(),
      {
        expiresIn: '1d',
      },
    );

    return { token, userModel, userExists };
  }

  /**
   * This method registers a user and its address and returns the user
   * @param user
   */
  async addUser(user: UserDto): Promise<User> {
    // add user to DB
    const userEntity = new User();
    Object.assign(userEntity, user);
    // const newUser = this.userRepository.addUser(userEntity);
    const newUser: User = await this.userRepository.create(userEntity).save();

    // add address to DB
    user.address[0].user = userEntity; // there should only be one address in the array at this stage
    const newAddress = await this.addressService.addAddress(user.address[0]);

    // update user with address
    newUser.addresses = [newAddress];

    // save the user
    await this.userRepository.updateUser(newUser);

    return userEntity;
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
  // async updateUser(userDto: UserDto): Promise<void> {
  //   const userEntity = new User();
  //   // userDtoToEntity(userDto, userEntity);
  //   const resp = await this.userRepository.updateUser(userEntity);
  // }

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
