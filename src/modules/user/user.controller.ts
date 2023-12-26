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
import {
  createError,
  createResponse,
  encryptedResponse,
} from '../../common/util/response';
import { decryptKms, encryptKms, toBuffer } from 'src/common/util/crypto';
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
  @Post('signup')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
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

      // TODO: remove
      console.log('userDto: ' + JSON.stringify(userDto));

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

    async function encryptPayload(payload: {
      status: boolean;
      message: string;
      payload: any;
    }) {
      // convert payload to buffer
      const payloadToEncryptBuffer = toBuffer(payload);

      // encrypt payload
      const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);

      // convert encyrpted blob to base64 string
      const encryptedResp = encryptedUserBlob.toString('base64');

      return encryptedResp;
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
    @Body() requestBody: any,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      const decryptedBody = await decryptKms(requestBody.payload);

      const userDto = new UpdateUserDto();
      Object.assign(userDto, decryptedBody);
      const authId = res.locals.id;

      userDto.profileImage = files?.profileImage[0] || null;

      const auth = await this.authService.getAuth({ id: authId });
      userDto.id = auth.user.id;

      if (auth == null) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('user update failed', 'user does not exist'));
      }

      if (userDto.code) {
        const isOtpVerified = await this.authService.verifyOtp(
          auth.id,
          userDto.code,
        );

        if (!isOtpVerified.status) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json(createError('user update failed', isOtpVerified.message));
        }
      }

      await this.userService.updateUserInfo(userDto, authId);

      // generate token
      const token = this.authService.generateJwt(userDto.id);

      // get back the user info
      const authObj = await this.authService.getAllUserInfo({
        userId: userDto.id,
      });
      const user: UserDto = mapAuthToUser(authObj); // rename to map user from Auth

      // encrypt the response
      const payload = {
        payload: {
          token,
          user,
        },
      };
      const payloadToEncryptBuffer = toBuffer(payload);
      const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);
      const encryptedResp = encryptedUserBlob.toString('base64');

      return res.status(HttpStatus.OK).json(createResponse(encryptedResp));
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
