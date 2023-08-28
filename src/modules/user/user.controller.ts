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
import { createError, createResponse } from '../../common/util/response';

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
    @Body() requestBody,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // get user id from auth middleware
      const userID = res.locals.userId;

      const createUserDto = new CreateUserDto();
      Object.assign(createUserDto, { ...requestBody, _id: userID });

      // check if user exists with email or mobile
      const userExists = await this.userAccountService.getUserId(
        createUserDto.email,
        createUserDto.mobile,
      );

      if (userExists) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'user already exists',
        });
      }

      // make sure user exists in temp user account for customer
      if (createUserDto.profileType === 'customer') {
        const tempUserAccount =
          await this.userAccountService.findUserInTempAccount(userID);

        if (!tempUserAccount) {
          return res.status(HttpStatus.NOT_FOUND).json({
            message: 'user not found in temp account', // user should have been created in temp account during otp verification
          });
        }
      }

      // create the user(customer/merchant) and pass the user account id
      const user = await this.userService.create(createUserDto);
      const token = user.token;

      // pass response from request and created user id to account service
      const userAccountDto = new CreateUserAccountDto();
      Object.assign(userAccountDto, { _id: userID, ...createUserDto });

      // update auth account
      const authDto = new CreateAuthDto();
      Object.assign(authDto, { user_account_id: userID, ...requestBody });
      await this.authService.updateAccount(authDto, userID);

      // create user account
      await this.userAccountService.create(userAccountDto, userID);

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('user successfully registered', { token }));
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to register user', err.message));
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

      return res
        .status(HttpStatus.CREATED)
        .json(
          createResponse('user successfully registered', { accounts, users }),
        );
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to get list of users', error.message));
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

      return res
        .status(HttpStatus.OK)
        .json(createResponse('user information fetched', { account, user }));
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to retrieve user information', err.message));
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

      return res
        .status(HttpStatus.OK)
        .json(createResponse('user information updated', { account, user }));
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to register user', err.message));
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

      return res
        .status(HttpStatus.OK)
        .json(createResponse('user information updated', { account, user }));
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to delete user', err.message));
    }
  }
}
