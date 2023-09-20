import { InputObject } from './../auth/auth.repository';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
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
import { Address } from './entities/address.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { Auth } from '../auth/entities/auth.entity';
import { AuthService } from '../auth/auth.service';
import { UserFileService } from '../files/user-files.service';
import { mapAuthToUser, mapUserData } from './user-mapper';
import { UserRepository } from './user.repository';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private readonly authService: AuthService,
    private userFileService: UserFileService,
  ) {}
  /**
   *
   * @param CreateUserDto - parsed request body
   * @returns
   */
  async create(userDto: CreateUserDto): Promise<any> {
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
      const { address, ...userData } = userDto;

      const addressId = await this.addressRepository.create({
        primary: true,
        ...address,
      });

      userDto.addresses = [addressId];

      let userId: string;

      if (!userData.profileImage) {
        userDto.profileImageUrl = await this.userFileService.getRandomAvatar();
      } else {
        userDto.profileImageUrl = await this.userFileService.uploadProfileImage(
          userId,
          userData.profileImage,
        );
      }

      const newUser: User = mapUserData(userDto);

      userModel = await this.userRepository.create(newUser).save();

      await this.authService.updateAuthUserId(auth.id, userModel);
      addressId.user = userModel;
      await this.addressRepository.save(addressId);
    }

    const input: InputObject = { id: auth.id };
    const authObj = await this.authService.getUserWithAuth(input);
    const user: UserDto = mapAuthToUser(authObj);

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

  // /**
  //  * Get all users
  //  * @returns
  //  */
  // async findAll(): Promise<any> {
  //   try {
  //     const users = await this.userModel.find().exec();
  //     return users;
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving all users from database
  //       \nfrom findAll method in user.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  *
  //  * @param id
  //  * @returns
  //  */
  // async findOne(id: string): Promise<any> {
  //   try {
  //     const user = await this.userModel.findById(id).exec();
  //     // throw error if user does not exist
  //     if (!user) {
  //       throw new Error(`User with id ${id} not found`);
  //     }
  //     if (user.deleted) {
  //       throw new Error(`User with id ${id} has been deleted`);
  //     }
  //     return user;
  //   } catch (error) {
  //     throw new Error(
  //       `Error getting user information for user with id ${id},
  //       \nfrom findOne method in user.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  *
  //  * @param id
  //  */
  // async update(id: string): Promise<void> {
  //   try {
  //     // no field to update, but change updatedAt to latest
  //     await this.userModel.updateOne(
  //       { _id: id },
  //       { $set: { updatedAt: new Date() } },
  //     );
  //   } catch (error) {
  //     throw new Error(
  //       `Error update user information for user with id ${id},
  //       \nfrom update method in user_account.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  * Implementing soft delete
  //  * @param id - user id
  //  * @returns
  //  */
  // async remove(id: string): Promise<any> {
  //   try {
  //     const user = await this.userModel
  //       .findById(id, { deleted: 'true' })
  //       .exec();
  //     if (!user) {
  //       throw new Error(
  //         `Mongoose error with deleting user with user id ${id}
  //         In remove method user.service.ts with dev error message: user with id:${id} not found`,
  //       );
  //     }
  //     return user;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from remove method in user.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
