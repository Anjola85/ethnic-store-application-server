/**
 * This class contains business logic related to the user database
 */
import { AddressService } from './../address/address.service';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';
import { UserFileService } from '../files/user-files.service';
import { UserRepository } from './user.repository';
import { UpdateUserDto } from './dto/update-user.dto';
import { Address } from '../address/entities/address.entity';
import { UserRespDto } from 'src/contract/version1/response/user-response.dto';
import { UserProcessor } from './user.processor';
import { AuthService } from '../auth/auth.service';
import { Auth } from 'aws-sdk/clients/docdbelastic';
import { Mobile } from 'aws-sdk';
import { AddressProcessor } from '../address/address.processor';

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
  async register(userDto: UserDto): Promise<User> {
    try {
      let userEntity = new User();
      Object.assign(userEntity, userDto);
      const newUser: User = await this.userRepository.save(userEntity);
      newUser.auth = userDto.auth;
      newUser.save();

      // if address was provided during registration
      if (userDto.address) {
        console.log('trying to add address');
        const address = Object.assign(new Address(), userDto.address);
        address.user = newUser;
        const newAddress = await this.addressService.addAddress(
          userDto.address,
        );
        newUser.addresses = []; // DO NOT DELETE
        newUser.addresses = [newAddress];
        userEntity = await this.userRepository.save(newUser);
      } else {
        userEntity.addresses = null;
      }

      return userEntity;
    } catch (error) {
      if (error.code === '23505') {
        throw new ConflictException('User already exists');
      }

      this.logger.error(
        'Error thrown in user.service.ts, register method: ' + error,
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
   * This method returns all user relations by its id
   *
   * @param userId
   * @returns - user object with all relations
   */
  async getUserRelationsById(userId: number): Promise<User> {
    try {
      const user: User = await this.userRepository.getUserWithRelations(userId);
      return user;
    } catch (error) {
      this.logger.error(
        'Error thrown in user.service.ts, getUserRelationsById method: ' +
          error,
      );
      throw new Error(
        'Error ocurred from user repository with retrieving user relations',
      );
    }
  }

  /**
   * This method reurns all user relations asides the FAVOURITES
   *
   * @param userId
   * @returns
   */
  async getUserInfoById(userId: number): Promise<User> {
    try {
      const user: User = await this.userRepository.getUserInfoById(userId);
      return user;
    } catch (error) {
      this.logger.error(
        'Error thrown in user.service.ts, getUserInfo method: ' + error,
      );
      throw new Error(
        'Error ocurred from user repository with retrieving user information',
      );
    }
  }

  /**
   * Pre-condition: client has to be from authService and have a valid token, user has to exist
   * This updates an existing user's info
   * @param userDto
   * @returns {token, user}
   */
  async updateUserInfo(
    userDto: UpdateUserDto,
    existingUser: User,
  ): Promise<UserRespDto> {
    if (userDto.profileImage) {
      userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
        existingUser.id,
        userDto.profileImage,
      );

      this.userRepository.updateUserImageUrl(
        existingUser.id,
        userDto.profileImageUrl,
      );
    }

    const updatedUser: User = Object.assign(new User(), existingUser);

    updatedUser.firstname = userDto.firstname || existingUser.firstname;
    updatedUser.lastname = userDto.lastname || existingUser.lastname;
    updatedUser.countryOfOrigin =
      userDto.countryOfOrigin || existingUser.countryOfOrigin;

    this.userRepository.save(updatedUser);

    const resp: UserRespDto = UserProcessor.mapEntityToResp(updatedUser);
    return resp;
  }
}
