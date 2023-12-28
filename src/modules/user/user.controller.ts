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
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  createError,
  createResponse,
  encryptedResponse,
} from '../../common/util/response';
import {
  decryptKms,
  encryptKms,
  encryptPayload,
  toBuffer,
} from 'src/common/util/crypto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { UpdateUserDto } from './dto/update-user.dto';
import { mapAuthToUser } from './user-mapper';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { EncryptedDTO } from 'src/common/dto/encrypted.dto';
import { SignupResponseDtoEncrypted } from 'src/common/responseDTO/signupResponse.dto';

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
  @ApiOperation({ summary: 'Sign up', description: 'Register a new user' })
  @ApiBody({
    schema: {
      oneOf: [
        { $ref: getSchemaPath(EncryptedDTO) },
        { $ref: getSchemaPath(UserDto) },
      ],
    },
  })
  @ApiHeader({
    name: 'Authorization',
    description: 'Authorization header with the Bearer token',
    required: true,
    schema: { type: 'string', default: 'Bearer ' },
  })
  @ApiResponse({
    status: 201,
    description: 'User registration successful.',
    type: SignupResponseDtoEncrypted,
  })
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async register(
    @Body() requestBody: EncryptedDTO,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug('sign up called with body: ' + requestBody);
      const decryptedBody = await decryptKms(requestBody.payload);
      this.logger.debug(
        'decrypted body request: ' + JSON.stringify(decryptedBody),
      );

      // map decrypted object to userDto
      const userDto = new UserDto();
      Object.assign(userDto, decryptedBody);
      userDto.profileImage = files?.profileImage[0] || null;

      const response: {
        token: string;
        user: UserDto;
        userExists: boolean;
      } = await this.userService.create(userDto);

      // const payload = {
      //   message: 'user successfully registered',
      //   payload: response,
      // };

      const payload = createResponse('user successfully registered', response);

      // encrypt payload
      const encryptedResp = await encryptPayload(payload);

      if (response.userExists)
        return res.status(HttpStatus.OK).json(encryptedResp);

      return res
        .status(HttpStatus.CREATED)
        .json(encryptedResponse(encryptedResp));
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

  // api to get user information
  @Get('info')
  async getUser(@Res() res: Response): Promise<any> {
    try {
      // get the authId from the res.locals
      const userId = res.locals.id;
      const crypto = res.locals.crypto;

      if (!userId)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('400 user not found', 'token invalid'));

      const userObj = await this.authService.getAllUserInfo({ userId });

      const payload = { payload: userObj, status: true, message: 'user found' };
      const encryptedResp = await encryptPayload(payload);

      // return encrypted response
      if (crypto === 'true')
        return res.status(HttpStatus.OK).json(encryptedResponse(encryptedResp));
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

  /**
   *
   * this shoudl check for what input fields has been provided and do the necessary update
   *
   * @param requestBody
   * @param files
   * @param res
   * @returns
   */
  @Patch('update')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  async updateUser(
    @Body() requestBody: EncryptedDTO,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const crypto = res.locals.crypto;
      const decryptedBody = await decryptKms(requestBody.payload);

      // map decrypted body to userDto
      const userDto = new UpdateUserDto();
      Object.assign(userDto, decryptedBody);

      // grab profile image and add it to the userDTO
      userDto.profileImage = files?.profileImage[0] || null;

      // get auth record with the userId
      const userId = res.locals.id;

      if (!userId)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('400 user not found', 'token invalid'));

      userDto.id = userId;

      const authObj = await this.authService.getAuth({ userId });

      // user not found
      if (authObj == null)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('user update failed', 'Could not find user'));

      await this.userService.updateUserInfo(userDto, authObj.id);
      const token = this.authService.generateJwt(userDto.id);
      const userInfo = await this.authService.getAllUserInfo({
        userId: userDto.id,
      });
      const user: UserDto = mapAuthToUser(userInfo); // rename to map user from Auth

      const payload = {
        message: 'Update successful',
        status: true,
        payload: {
          token,
          user,
        },
      };
      const resp = await encryptPayload(payload);
      if (crypto === 'true' || !crypto)
        return res.status(HttpStatus.OK).json(encryptedResponse(resp));
      else
        return res
          .status(HttpStatus.OK)
          .json(createResponse(payload.message, payload.payload));
    } catch (error) {
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
