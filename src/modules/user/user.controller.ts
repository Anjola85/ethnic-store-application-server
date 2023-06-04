import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Response } from 'express';
import { UserAccountService } from '../user_account/user_account.service';
import { CreateUserAccountDto } from '../user_account/dto/create-user_account.dto';
import { AuthService } from '../auth/auth.service';
import { CreateAuthDto } from '../auth/dto/create-auth.dto';
import { MobileUtil } from 'src/common/util/mobileUtil';

@Controller('user')
export class UserController {
  /**
   *
   * @param userService
   * @param userAccountService
   * @param authService
   */
  constructor(
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Registers a user to the DB
   * @param body - request passed by the user
   * @returns {*}
   */
  @Post('register')
  async create(
    // @Body() createUserDto: CreateUserDto,
    @Body() requestBody: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const createUserDto = new CreateUserDto();
      Object.assign(createUserDto, { ...requestBody });

      // check if user exists with email or mobile
      const userExists = this.userAccountService.userExists(
        createUserDto.email,
        createUserDto.mobile.phoneNumber,
      );

      if (userExists) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'user already exists',
        });
      }

      // create the user(customer/merchant) and pass the user account id
      const user = await this.userService.create(createUserDto);
      const userID: string = user.id;
      const token = user.token;

      // pass response from request and created user id to account service
      const userAccountDto = new CreateUserAccountDto();
      Object.assign(userAccountDto, { _id: userID, ...createUserDto });

      // create auth account, pass user account id to auth service
      const authDto = new CreateAuthDto();
      Object.assign(authDto, { user_account_id: userID, ...requestBody });
      const authAccount = await this.authService.create(authDto, userID);

      // create user account
      const account = await this.userAccountService.create(userAccountDto);

      return res.status(HttpStatus.CREATED).json({
        message: 'user successfully registered',
        auth: authAccount,
        account,
        token,
        user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'failed to register user',
        error: err.message,
      });
    }
  }

  /**
   *
   * @param res
   * @returns {*}
   */
  @Get('all')
  async findAll(@Res() res: Response): Promise<any> {
    try {
      // call user account service
      const accounts = await this.userAccountService.findAll();

      // call to userAccountService
      const users = await this.userService.findAll();

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'user successfully registered',
        accounts: accounts,
        users: users,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to get list of users',
        error: error.message,
      });
    }
    return this.userService.findAll();
  }

  /**
   * Retrieve information for a user
   * @param id - user id
   * @returns {*}
   */
  @Get('find/:id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
    try {
      // call to userAccountService
      const account = await this.userAccountService.findOne(id);

      // call user service
      const user = await this.userService.findOne(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'user information fetched',
        account: account,
        user: user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to retrieve user information',
        error: err.message,
      });
    }
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // get the id from the token

      // call to user account service
      const account = await this.userAccountService.update(id, updateUserDto);

      // call to user service
      const user = await this.userService.update(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'user information updated',
        account: account,
        user: user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to register user',
        error: err.message,
      });
    }
  }

  @Delete('delete/:id')
  async remove(@Param('id') id: string, @Res() res: Response): Promise<any> {
    try {
      // TODO: check if user has been deleted before by checking if condition is true

      // call to user account service
      const account = await this.userAccountService.remove(id);

      // call to user service
      const user = await this.userService.remove(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'user information updated',
        account: account,
        user: user,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to delete user',
        error: err.message,
      });
    }
  }
}
