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
import {
  decryptPayload,
  encryptKms,
  encryptPayload,
  toBuffer,
} from 'src/common/util/crypto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
// import { mapAuthToUser } from './user-mapper';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { EncryptedDTO } from 'src/common/dto/encrypted.dto';
import { User } from './entities/user.entity';

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
  // @Post('signup')
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  // )
  // @ApiOperation({ summary: 'Sign up', description: 'Register a new user' })
  // @ApiBody({
  //   schema: {
  //     oneOf: [
  //       { $ref: getSchemaPath(EncryptedDTO) },
  //       { $ref: getSchemaPath(UserDto) },
  //     ],
  //   },
  // })
  // @ApiHeader({
  //   name: 'Authorization',
  //   description: 'Authorization header with the Bearer token',
  //   required: true,
  //   schema: { type: 'string', default: 'Bearer ' },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'User registration successful.',
  //   type: SignupResponseDtoEncrypted,
  // })
  // @ApiResponse({ status: 400, description: 'Bad Request.' })
  // async register(
  //   @Body() userDto: UserDto,
  //   @UploadedFiles() files: any,
  // ): Promise<any> {
  //   try {
  //     this.logger.debug(
  //       'sign up endpoint called with body: ' + JSON.stringify(userDto),
  //     );

  //     userDto.profileImage = files?.profileImage[0] || null;
  //     userDto.profileImage = files?.backgroundImagee[0] || null;

  //     const response: {
  //       token: string;
  //       user: UserDto;
  //       userExists: boolean;
  //     } = await this.userService.register(userDto);

  //     if (response.userExists)
  //       return createResponse('user with credentials already exist', response);
  //     else return createResponse('user successfully registered', response);
  //   } catch (error) {
  //     this.logger.error(
  //       "Error occurred in 'register' method of UserController with error: " +
  //         error,
  //     );
  //     // Handle any error that occurs during the registration process
  //     if (error instanceof UnauthorizedException)
  //       throw new UnauthorizedException(error.message);

  //     throw new InternalServerError(error.message);
  //   }
  // }

  /**
   * Get user info
   * @param res
   * @returns
   */
  @Get('user-info')
  async getUser(@Res() res: Response): Promise<any> {
    try {
      // get the authId from the res.locals
      const userId = res.locals.id;
      const crypto = res.locals.crypto;

      if (!userId)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('400 user not found', 'token invalid'));

      // TODO: come back here to fix
      const userObj = await this.authService.getAllUserInfo({ authId: userId });

      const payload = { payload: userObj, status: true, message: 'user found' };
      const encryptedResp = await encryptPayload(payload);

      // return encrypted response
      if (crypto === 'true')
        return res
          .status(HttpStatus.OK)
          .json(createEncryptedResponse(encryptedResp));
      else
        return res
          .status(HttpStatus.OK)
          .json(createResponse('user found', userObj));
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
