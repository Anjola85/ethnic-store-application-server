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

      const user = await this.userService.create(requestBody);

      if (user.exist) {
        return res
          .status(HttpStatus.OK)
          .json(createResponse('user already exists', user));
      }

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('user successfully registered', user));
    } catch (err) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('failed to register user', err.message));
    }
  }
  // /**
  //  *
  //  * @param res
  //  * @returns {*}
  //  */
  // @Get('all')
  // async findAll(@Res() res: Response): Promise<any> {
  //   try {
  //     // call user account service
  //     const accounts = await this.userAccountService.findAll();
  //     // call to userAccountService
  //     const users = await this.userService.findAll();
  //     return res
  //       .status(HttpStatus.CREATED)
  //       .json(
  //         createResponse('user successfully registered', { accounts, users }),
  //       );
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json(createError('failed to get list of users', error.message));
  //   }
  //   return this.userService.findAll();
  // }
  // /**
  //  * Retrieve information for a user
  //  * @param id - user id
  //  * @returns {*}
  //  */
  // @Get('find/:id')
  // async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
  //   try {
  //     // call to userAccountService
  //     const account = await this.userAccountService.findOne(id);
  //     // call user service
  //     const user = await this.userService.findOne(id);
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(createResponse('user information fetched', { account, user }));
  //   } catch (err) {
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json(createError('failed to retrieve user information', err.message));
  //   }
  // }
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateUserDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     // get the id from the token
  //     // call to user account service
  //     const account = await this.userAccountService.update(id, updateUserDto);
  //     // call to user service
  //     const user = await this.userService.update(id);
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(createResponse('user information updated', { account, user }));
  //   } catch (err) {
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json(createError('failed to register user', err.message));
  //   }
  // }
  // @Delete('delete/:id')
  // async remove(@Param('id') id: string, @Res() res: Response): Promise<any> {
  //   try {
  //     // TODO: check if user has been deleted before by checking if condition is true
  //     // call to user account service
  //     const account = await this.userAccountService.remove(id);
  //     // call to user service
  //     const user = await this.userService.remove(id);
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(createResponse('user information updated', { account, user }));
  //   } catch (err) {
  //     return res
  //       .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //       .json(createError('failed to delete user', err.message));
  //   }
  // }
}
