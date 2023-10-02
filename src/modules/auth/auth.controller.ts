import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';
import { EncryptedDTO } from '../../common/dto/encrypted.dto';
import { AwsSecretKey } from 'src/common/util/secret';
import { createError, createResponse } from '../../common/util/response';
import { secureLoginDto } from './dto/secure-login.dto';
import { ApiBody } from '@nestjs/swagger';
import { UserDto } from '../user/dto/user.dto';
import { decryptKms, encryptKms, toBuffer } from 'src/common/util/crypto';
import { GeocodingService } from '../geocoding/geocoding.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly awsSecretKey: AwsSecretKey,
    private readonly geocodingService: GeocodingService,
  ) {}

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      if (body.payload && body.payload !== '') {
        const decryptedData = await decryptKms(body.payload);
        const loginDto = new secureLoginDto();
        Object.assign(loginDto, decryptedData);

        const auth = await this.authService.findByEmailOrMobile(
          loginDto.email,
          loginDto.mobile,
        );

        if (!auth) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json(createError('user not found'));
        }

        await this.authService.verifyOtp(auth.id, loginDto.code);

        const loginResponse: { token: string; user: UserDto } =
          await this.authService.login(loginDto);

        const payload = {
          payload: loginResponse,
        };
        const payloadToEncryptBuffer = toBuffer(payload);
        const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);
        const encryptedUser = encryptedUserBlob.toString('base64');

        return res
          .status(HttpStatus.OK)
          .json(createResponse('login successful', encryptedUser, true));
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('payload is required'));
      }
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('login failed', error.message));
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('login failed', error.message));
      }
    }
  }

  /**
   * Verifies the otp
   * @param body
   * @param res
   * @returns
   */
  @Post('verify')
  async verifyOtp(@Body() body: any, @Res() res: Response) {
    try {
      this.logger.debug('verifyOtp called with payload: ' + body.payload);

      if (body.payload && body.payload !== '') {
        const decryptedData = await decryptKms(body.payload);

        this.logger.debug(
          'verifyOtp decrypted payload: ' + JSON.stringify(decryptedData),
        );

        const authId = res.locals.id;
        const { code } = decryptedData;

        const isOtpVerified = await this.authService.verifyOtp(authId, code);

        if (!isOtpVerified.status) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json(
              createError('otp verification failed', isOtpVerified.message),
            );
        }

        this.logger.debug(
          'response from verifyOtp: ' + JSON.stringify(isOtpVerified),
        );

        return res
          .status(HttpStatus.OK)
          .json(createResponse('otp verification successful'));
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('payload is required'));
      }
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('otp verification failed', error.message));
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('otp verification failed', error.message));
      }
    }
  }

  // @Post('signup')
  // @UseInterceptors(
  //   FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  // )
  // async register(
  //   @Body() requestBody: any,
  //   @UploadedFiles() files: any,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const decryptedBody = await decryptKms(requestBody.payload);

  //     const authId = res.locals.id;
  //     const isOtpVerified = await this.authService.verifyOtp(
  //       authId,
  //       decryptedBody.code,
  //     );

  //     if (!isOtpVerified.status) {
  //       return res
  //         .status(HttpStatus.BAD_REQUEST)
  //         .json(
  //           createError('user registeration failed', isOtpVerified.message),
  //         );
  //     }

  //     // convert decrypted to createuserDto
  //     const userDto = new UserDto();
  //     Object.assign(userDto, decryptedBody);
  //     userDto.profileImage = files?.profileImage[0] || null;

  //     const result = await this.userController.create(userDto, res);

  //     return 'result';
  //   } catch (error) {
  //     // Handle any error that occurs during the registration process
  //     if (error instanceof InternalServerError) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json(createError('500 user registeration failed', error.message));
  //     } else if (error instanceof UnauthorizedException) {
  //       return res
  //         .status(HttpStatus.UNAUTHORIZED)
  //         .json(createError('401 user registeration failed', error.message));
  //     }
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(createError('400 user registeration failed ', error.message));
  //   }
  // }

  @Post('sendOtp')
  async sendOtp(@Body() body: EncryptedDTO, @Res() res: Response) {
    try {
      this.logger.debug('sendOtp called with payload: ' + body.payload);
      // handle decryption of request body
      const decrypted = await decryptKms(body.payload);
      const requestBody = new TempUserAccountDto();
      Object.assign(requestBody, decrypted);

      this.logger.debug(
        'sendOtp decrypted payload: ' + JSON.stringify(requestBody),
      );

      const authResponse = await this.authService.sendOtp(
        requestBody.email,
        requestBody.mobile,
      );

      this.logger.debug(
        'sendOtp clear response: ' + JSON.stringify(authResponse),
      );

      // encrypt the response
      const payload = {
        payload: { token: authResponse.token },
      };

      const payloadToEncryptBuffer = toBuffer(payload);
      const encryptedUserBlob = await encryptKms(payloadToEncryptBuffer);
      const encryptedPayload = encryptedUserBlob.toString('base64');

      this.logger.debug(
        'sendOtp encrypted payload: ' + JSON.stringify(encryptedPayload),
      );
      return res
        .status(HttpStatus.OK)
        .json(createResponse(authResponse.message, encryptedPayload));
    } catch (error) {
      this.logger.error(
        'Auth Controller with error message: ' + error.message,
        ' with error: ' + error,
      );
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(createError('400 send otp failed'));
    }
  }

  @Post('sendOTPBySms')
  async sendOTPBySms(@Body() requestBody: any, @Res() res: Response) {
    const { phone_number } = requestBody;
    try {
      await this.authService.sendOtp(phone_number);
      return res
        .status(HttpStatus.OK)
        .json(createResponse('SMS sent successfully.'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(createError('Failed to send SMS.', error.message));
    }
  }

  // TODO: delete user endpoint

  // From here: to be deleted
  // @Post('reset')
  // async reset(@Query('clear') clear: boolean, @Res() res: Response) {
  //   try {
  //     // take in query param resetType to be true or false
  //     if (clear === undefined || clear === null) {
  //       return res.status(HttpStatus.BAD_REQUEST).json({
  //         message: 'clear query param is required',
  //       });
  //     } else if (clear === false) {
  //       return res.status(HttpStatus.OK).json({
  //         message: 'clear query param must be true in order to reset',
  //       });
  //     }
  //     // reset user account
  //     await this.authService.deleteRegisteredUsers();
  //     return res.status(HttpStatus.OK).json(createResponse('reset successful'));
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(
  //         createError(
  //           `400 reset failed from auth.controller.ts`,
  //           error.message,
  //         ),
  //       );
  //   }
  // }

  @Post('encrypt')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: {
          // just include the object you want to encrypt here
          example: 'this is a test',
        },
      },
    },
  })
  async encrypt(@Body() requestBody: any, @Res() res: Response): Promise<any> {
    try {
      const data = requestBody.payload;
      // convert data to buffer
      const buffer: Buffer = toBuffer(data);
      const encryptedData = await encryptKms(buffer);
      return res.status(HttpStatus.OK).json({
        status: true,
        data: encryptedData.toString('base64'),
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: `400 encrypt failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  @Post('decrypt')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: {
          // just include the encrypted data here
          example: 'this is a test',
        },
      },
    },
  })
  async decrypt(@Body() requestBody: any, @Res() res: Response) {
    try {
      const decryptedData = await decryptKms(requestBody.payload);
      return res.status(HttpStatus.OK).json({
        status: true,
        data: decryptedData,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: false,
        message: `400 decrypt failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }
}
