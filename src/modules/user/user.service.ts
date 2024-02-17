/**
 * This class contains business logic related to the user database
 */
import { AddressService } from './../address/address.service';
import { Injectable, Logger } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { AuthService } from '../auth/auth.service';
import { UserFileService } from '../files/user-files.service';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';
import { Address } from '../address/entities/address.entity';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    private userRepository: UserRepository,
    private addressService: AddressService,
    private userFileService: UserFileService,
  ) {}

  // async register(userDto: UserDto): Promise<any> {
  //   try {
  //     let userModel: User;
  //     let userExists: boolean;

  //     const mobile = new Mobile();
  //     Object.assign(mobile, userDto.mobile);

  //     const registeredMobile = await this.mobileService.getMobile(mobile);

  //     const auth: Auth = registeredMobile?.auth || null;

  //     if (auth) {
  //       if (auth.user) {
  //         // user already exists
  //         userExists = true;
  //         userModel = auth.user;
  //       } else {
  //         // user does not exist
  //         userExists = false;
  //         userDto.auth = auth;
  //         userModel = await this.addUser(userDto);
  //       }

  //       // generate random avatar
  //       // if (!userDto.profileImage)
  //       //   userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
  //       // else
  //       //   userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
  //       //     newUserEntity.id,
  //       //     userDto.profileImage,
  //       //   );

  //       this.logger.debug(
  //         'user registered successfully: ' + JSON.stringify(userModel),
  //       );

  //       // generate jwt token with user id
  //       const token = this.authService.generateJwt(userModel);

  //       return { token, userModel, userExists };
  //     } else {
  //       throw new Error(
  //         'Mobile does not have auth, this SHOULD NEVER HAPPEN, sendOTP should be called before this',
  //       );
  //     }
  //   } catch (error) {
  //     this.logger.debug(
  //       'Error thrown in user.service.ts, register method: ' + error,
  //     );
  //   }
  // }

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

  /**
   * This method returns a user object by its id
   * @param id
   * @returns
   */
  async getUserById(id: number): Promise<User> {
    const user = await this.userRepository.getUserById(id);
    return user;
  }

  /**
   * Pre-condition: client has to be from authService and have a valid token, user has to exist
   * This updates an existing user's info
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(userDto: UpdateUserDto): Promise<void> {
    // check if profile image was provided and upload it
    if (userDto.profileImage) {
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        userDto.id,
        userDto.profileImage,
      );

      this.userRepository.updateUserImageUrl(
        userDto.id,
        userDto.profileImageUrl,
      );
    }

    // update user account
    if (userDto.firstName || userDto.lastName) {
      if (userDto.firstName) userDto.firstName = userDto.firstName;
      if (userDto.lastName) userDto.lastName = userDto.lastName;

      const user = new User();
      Object.assign(user, userDto);

      this.userRepository.updateUser(user);
    }
  }
}
