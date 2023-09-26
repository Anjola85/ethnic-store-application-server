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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import { createError, createResponse } from '../../common/util/response';
import { decryptKms, encryptKms, toBuffer } from 'src/common/util/crypto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  /**
   * Registers a user to the DB
   * @param body - request passed by the user
   * @returns {*}
   */
  @Post('signup')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  async register(
    @Body() requestBody: any,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const decryptedBody = await decryptKms(requestBody.payload);

      const authId = res.locals.id;
      const isOtpVerified = await this.authService.verifyOtp(
        authId,
        decryptedBody.code,
      );

      if (!isOtpVerified.status) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createError('user registeration failed', isOtpVerified.message),
          );
      }

      // convert decrypted to createuserDto
      const userDto = new UserDto();
      Object.assign(userDto, decryptedBody);
      userDto.profileImage = files?.profileImage[0] || null;

      const response: {
        token: string;
        user: UserDto;
        userExists: boolean;
      } = await this.userService.create(userDto);

      const payload = {
        payload: response,
      };
      const payloadToEncryptBuffer = toBuffer(payload);
      const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);
      const encryptedUser = encryptedUserBlob.toString('base64');

      if (response.userExists) {
        return res
          .status(HttpStatus.OK)
          .json(createResponse('user already exists: ', encryptedUser));
      }

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('user successfully registered', encryptedUser));
    } catch (error) {
      this.logger.error(
        "Error occurred in 'create' method of UserController with error: " +
          error,
      );
      // Handle any error that occurs during the registration process
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createError('500 user registeration failed', error.message));
      } else if (error instanceof UnauthorizedException) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createError('401 user registeration failed', error.message));
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(createError('400 user registeration failed ', error.message));
    }
  }

  /**
   *
   * this shoudl check for what input fields has been provided and do the necessary update
   *
   * @param requestBody
   * @param files
   * @param res
   * @returns
   */
  @Patch('upadte-user')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  async updateUser(
    @Body() requestBody: any,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const decryptedBody = await decryptKms(requestBody.payload);

      // convert decrypted to createuserDto
      const userDto = new UserDto();
      Object.assign(userDto, decryptedBody);
      userDto.id = res.locals.id; // get user id from auth middleware
      userDto.profileImage = files?.profileImage[0] || null;

      // update user info
      await this.userService.updateUserInfo(userDto);

      // generate token
      const token = this.authService.generateJwt(userDto.id);

      // get back the user info
      const user = await this.authService.getAllUserInfo({
        userId: userDto.id,
      });

      // encrypt the response
      const payload = {
        payload: {
          token,
          user,
        },
      };
      const payloadToEncryptBuffer = toBuffer(payload);
      const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);
      const encryptedUser = encryptedUserBlob.toString('base64');

      return encryptedUser;
    } catch (error) {
      // Handle any error that occurs during the registration process
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createError('500 user registeration failed', error.message));
      } else if (error instanceof UnauthorizedException) {
        return res
          .status(HttpStatus.UNAUTHORIZED)
          .json(createError('401 user registeration failed', error.message));
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(createError('400 user registeration failed ', error.message));
    }
  }
}
