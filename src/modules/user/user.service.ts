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

  /**
   * This method registers a new user and address into the database
   * @param user - user dto object
   * @returns user - user entity with address
   */
  async registerUserAndAddress(user: UserDto): Promise<User> {
    try {
      let userEntity = new User();
      Object.assign(userEntity, user);
      const newUser: User = await this.userRepository.create(userEntity).save();

      const address = Object.assign(new Address(), user.address);
      address.user = newUser;

      const newAddress = await this.addressService.addAddress(user.address);
      newUser.addresses = [];
      newUser.addresses = [newAddress];
      userEntity = await this.userRepository.save(newUser);

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

  async getUserInfoById(userId: number): Promise<User> {
    const user: User = await this.userRepository.getUserWithRelations(userId);
    return user;
  }
}
