import { Injectable } from '@nestjs/common';
import { CreateUserAccountDto } from './dto/create-user_account.dto';
import { UpdateUserAccountDto } from './dto/update-user_account.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserAccount,
  UserAccountDocument,
} from './entities/user_account.entity';

@Injectable()
export class UserAccountService {
  constructor(
    @InjectModel(UserAccount.name)
    private userAccountModel: Model<UserAccountDocument>,
  ) {}

  async create(userAccountDto: CreateUserAccountDto): Promise<UserAccount> {
    try {
      const account = new this.userAccountModel({ ...userAccountDto });
      const userAccount = await account.save();
      return userAccount;
    } catch (error) {
      throw new Error(
        `Error creating user account, from create method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findAll(): Promise<any> {
    try {
      const users = await this.userAccountModel.find().exec();
      return users;
    } catch (error) {
      throw new Error(
        `Error retrieving users from database 
        \nfrom create method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const user = await this.userAccountModel.findById(id).exec();
      // throw error if user does not exist
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      if (user.deleted) {
        throw new Error(`User with id ${id} has been deleted`);
      }

      return user;
    } catch (error) {
      throw new Error(
        `Error getting user information for user with id ${id}, 
        \nfrom findOne method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateUserAccountDto: UpdateUserAccountDto,
  ): Promise<any> {
    try {
      const updatedAccount = await this.userAccountModel
        .findByIdAndUpdate(id, {
          ...updateUserAccountDto,
        })
        .exec();

      // check for error
      if (!updatedAccount) {
        throw new Error(
          `Error updating user account from mongoose
          method: user_account.service.ts. 
            \ndev error: account with ${id} not found`,
        );
      }
      return updatedAccount;
    } catch (error) {
      throw new Error(
        `Error updating user account, from update method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const account = await this.userAccountModel
        .findById(id, { deleted: 'true' })
        .exec();
      if (!account) {
        throw new Error(
          `Mongoose error with deleting user with user id ${id}
          \nIn remove method user_account.service.ts\nwith dev error message: user with id:${id} not found`,
        );
      }
      return account;
    } catch (error) {
      throw new Error(
        `Error from remove method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Helper methods
   */
  async findUserByEmail(email: string): Promise<any> {
    try {
      const user = await this.userAccountModel.find({ email: email }).exec();
      return user;
    } catch (error) {
      throw new Error(
        `Error from findUserByEmail method in user_account.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }
}
