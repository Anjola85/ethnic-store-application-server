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

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
    try {
      // check if user already exists
      let user;
      let exists = true;

      const auth = await this.authService.findByEmailOrMobile(
        userDto.email,
        userDto.mobile,
      );

      if (!auth.user) {
        // if user doesnt exist, create user
        exists = false;
        const { address, ...userData } = userDto;

        const addressId = await this.addressRepository.create({
          primary: true,
          ...address,
        });

        // console.log('address successfully created with object: ', addressId);

        if (!userData.profile_picture) {
          userData.profile_picture =
            await this.userFileService.getRandomAvatar();
        } else {
          // upload image to S3 bucket and get url
        }

        user = await this.userRepository
          .create({
            ...userData,
            addresses: [addressId],
            user_profile: userData.user_profile || UserProfile.CUSTOMER,
          })
          .save();

        // update auth table with user id
        await this.authService.updateAuthUserId(auth.id, user);

        addressId.user = user;
        await this.addressRepository.save(addressId);
      } else {
        user = auth.user;
      }

      // create jwt token with user id and set expiry to 1 day
      const privateKey = fs.readFileSync('./private_key.pem');
      const token = jsonwebtoken.sign({ id: user.id }, privateKey.toString(), {
        expiresIn: '1d',
      });

      return { token, user, exists };
    } catch (error) {
      throw new Error(
        `Error registering user from create method in user.service.ts. With error message: ${error.message}`,
      );
    }
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
