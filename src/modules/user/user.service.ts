import { SignupOtpRequest } from './../../contract/version1/request/auth/signupOtp.request';
import { AddressService } from './../address/address.service';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
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
import { Auth, AuthParams } from '../auth/entities/auth.entity';
import { MobileService } from '../mobile/mobile.service';
import { Mobile } from '../mobile/mobile.entity';
import { Address } from '../address/entities/address.entity';
import { OtpResponse } from 'src/contract/version1/response/auth/otp.response';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private userRepository: UserRepository,
    private addressService: AddressService,
    private mobileService: MobileService,
    private authService: AuthService,
    private userFileService: UserFileService,
  ) {}

  /**
   * If user exists, throw error
   * If user does not exist, sendOTP
   * @param body
   */
  async signupOtpRequest(body: SignupOtpRequest): Promise<OtpResponse> {
    try {
      const { email, mobile } = body;

      if (mobile) {
        console.log('checking if mobile exists');
        const registeredMobile = await this.mobileService.getMobile(mobile);

        if (registeredMobile)
          throw new ConflictException('phone number already exists');

        console.log('mobile does not exist');
      } else if (email) {
        const auth = await this.authService.findByEmail(body.email);

        if (auth) throw new ConflictException('email already exists');
      }

      console.log('sending otp');

      const auth: OtpResponse = await this.authService.sendOtp(
        body.email,
        body.mobile,
      );

      console.log(auth);

      if (null == auth)
        throw new Error('From signupOtpRequest: sendOTP returned null');

      return auth;
    } catch (error) {
      this.logger.debug(
        'Error thrown in user.service.ts, requestSignup method: ' + error,
      );

      throw error;
    }
  }

  /**
   * This method registers a user and returns the user
   * pre-condition: userDto must have mobile provided
   * @param userDto
   * @returns
   */
  async register(userDto: UserDto): Promise<any> {
    try {
      let userModel: User;
      let userExists: boolean;

      const mobile = new Mobile();
      Object.assign(mobile, userDto.mobile);

      const registeredMobile = await this.mobileService.getMobile(mobile);

      const auth: Auth = registeredMobile?.auth || null;

      if (auth) {
        if (auth.user) {
          // user already exists
          userExists = true;
          userModel = auth.user;
        } else {
          // user does not exist
          userExists = false;
          userDto.auth = auth;
          userModel = await this.addUser(userDto);
        }

        // generate random avatar
        // if (!userDto.profileImage)
        //   userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
        // else
        //   userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        //     newUserEntity.id,
        //     userDto.profileImage,
        //   );

        this.logger.debug(
          'user registered successfully: ' + JSON.stringify(userModel),
        );

        // generate jwt token with user id
        const token = this.authService.generateJwt(userModel);

        return { token, userModel, userExists };
      } else {
        throw new Error(
          'Mobile does not have auth, this SHOULD NEVER HAPPEN, sendOTP should be called before this',
        );
      }
    } catch (error) {
      this.logger.debug(
        'Error thrown in user.service.ts, register method: ' + error,
      );
    }
  }

  /**
   * This method registers a user and its address and returns the user
   * @param user
   */
  async addUser(user: UserDto): Promise<User> {
    try {
      // add user to DB
      let userEntity = new User();
      Object.assign(userEntity, user);
      // const newUser = this.userRepository.addUser(userEntity);
      const newUser: User = await this.userRepository.create(userEntity).save();

      // add address to DB
      const address = new Address();
      Object.assign(address, user.address[0]);
      address.user = newUser;
      const newAddress = await this.addressService.addAddress(user.address[0]);

      console.log('done adding address to DB');

      // update user with address
      newUser.addresses = [newAddress];

      // save the user
      userEntity = await this.userRepository.save(newUser);

      console.log("updating user with address's id");

      return userEntity;
    } catch (error) {
      this.logger.debug(
        'Error thrown in user.service.ts, addUser method: ' + error,
      );
    }
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
