import {
  Controller,
  Post,
  Body,
  Res,
  HttpStatus,
  Logger,
  Patch,
  UnauthorizedException,
  UploadedFiles,
  UseInterceptors,
  Get,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  createError,
  createResponse,
  createEncryptedResponse,
} from '../../common/util/response';
import { encryptPayload } from 'src/common/util/crypto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { UserRespDto } from 'src/contract/version1/response/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProcessor } from './user.processor';
import { User } from './entities/user.entity';
import { MobileService } from '../mobile/mobile.service';
import { Mobile } from '../mobile/mobile.entity';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mobileService: MobileService,
  ) {}

  /**
   * Get user info
   * @param res
   * @returns
   */
  @Get('info')
  async getUser(@Res() res: Response): Promise<any> {
    try {
      this.logger.log('get user info endpoint called');
      const userId = res.locals.userId;
      //TODO: set this back to true
      const crypto = res.locals.crypto || 'false';

      if (!userId)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('400 user not found', 'token invalid'));

      const user: User = await this.userService.getUserInfoById(userId);

      if (!user.auth) throw new Error('User does not have an auth');

      const mobile: Mobile = await this.mobileService.getMobileByAuth(
        user.auth,
      );

      // perform necessary mapping
      const resp = UserProcessor.processUserRelationInfo(user, mobile);

      this.logger.debug('successfully retrieved user information');

      //TODO: handle response (if encrypted or not)
      if (crypto === 'true') {
        const encryptedResp = await encryptPayload(
          createResponse('successfully retrieved user information', resp),
        );
        return res
          .status(HttpStatus.OK)
          .json(createEncryptedResponse(encryptedResp));
      } else {
        return res
          .status(HttpStatus.OK)
          .json(
            createResponse('successfully retrieved user information', resp),
          );
      }
    } catch (error) {
      this.logger.error(
        'Error thrown in user.controller.ts, getUser method: ' + error,
      );

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('500 internal server error', 'something went wrong'));
    }
  }

  @Patch('update')
  async updateUser(@Body() body: UpdateUserDto): Promise<any> {
    try {
      this.logger.log('update user endpoint called');

      const resp: UserRespDto = await this.authService.updateUserInfo(body);

      return createResponse('successfully updated user information', resp);
    } catch (error) {
      this.logger.error(
        'Error thrown in user.controller.ts, updateUser method: ' + error,
      );

      if (error instanceof InternalServerError) {
        throw new HttpException(
          'Error ocurred from user repository with updating user information',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error instanceof UnauthorizedException) {
        throw new HttpException(
          'Error ocurred from user repository with updating user information',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        "Something went wrong, we're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
