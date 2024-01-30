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
import { SignupResponseDtoEncrypted } from 'src/common/responseDTO/signupResponse.dto';
import { User } from './entities/user.entity';
import { SignupOtpRequest } from 'src/contract/version1/request/auth/signupOtp.request';
import { OtpResponse } from 'src/contract/version1/response/auth/otp.response';

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
    @Body() userDto: UserDto,
    @UploadedFiles() files: any,
  ): Promise<any> {
    try {
      // perform validation and map the request body to the userDto

      this.logger.debug(
        'sign up endpoint called with body: ' + JSON.stringify(userDto),
      );

      // TODO: remove this line if we're not assigning profile image
      userDto.profileImage = files?.profileImage[0] || null;

      const response: {
        token: string;
        user: UserDto;
        userExists: boolean;
      } = await this.userService.register(userDto);

      if (response.userExists)
        return createResponse('user with credentials already exist', response);
      else return createResponse('user successfully registered', response);
    } catch (error) {
      this.logger.error(
        "Error occurred in 'register' method of UserController with error: " +
          error,
      );
      // Handle any error that occurs during the registration process
      if (error instanceof UnauthorizedException)
        throw new UnauthorizedException(error.message);

      throw new InternalServerError(error.message);
    }
  }

  @Post('request-signup')
  async SignupOtpRequest(@Body() body: SignupOtpRequest) {
    try {
      this.logger.debug(
        'request-signup endpoint called with body: ' + JSON.stringify(body),
      );

      const resp: OtpResponse = await this.userService.signupOtpRequest(body);

      const payload = createResponse(resp.message, resp.token);

      return payload;
    } catch (error) {
      this.logger.error(
        "Error occurred in 'requestSignup' method of UserController with error: " +
          error,
      );
      // Handle any error that occurs during the registration process
      if (error instanceof ConflictException)
        throw new ConflictException(error.message);

      throw new HttpException(
        "Something went wrong, we're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
      const decryptedBody = await decryptPayload(requestBody.payload);

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

      // TODO: come back here to fix
      const authObj = await this.authService.getAuth({ authId: userId });

      // user not found
      if (authObj == null)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('user update failed', 'Could not find user'));

      await this.userService.updateUserInfo(userDto, authObj.id);

      // convert dto to user
      const userEntity = new User();
      Object.assign(userEntity, userDto);
      const token = this.authService.generateJwt(userEntity);
      // TODO: come back below to fix
      const userInfo = await this.authService.getAllUserInfo({
        authId: userDto.id,
      });
      // const user: UserDto = mapAuthToUser(userInfo); // rename to map user from Auth
      const user = null;

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
        return res.status(HttpStatus.OK).json(createEncryptedResponse(resp));
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
