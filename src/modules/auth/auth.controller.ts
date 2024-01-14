import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Logger,
  UseInterceptors,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';
import { EncryptedDTO } from '../../common/dto/encrypted.dto';
import { AwsSecretKey } from 'src/common/util/secret';
import {
  createError,
  createResponse,
  createEncryptedResponse,
} from '../../common/util/response';
import { secureLoginDto } from './dto/secure-login.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../user/dto/user.dto';
import {
  decryptKms,
  encryptKms,
  encryptPayload,
  toBuffer,
} from 'src/common/util/crypto';
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
        this.logger.debug('login called with payload: ' + body.payload);
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

        const loginResponse: { token: string; user: UserDto } =
          await this.authService.login(loginDto);

        this.logger.debug(
          'login clear response: ' + JSON.stringify(loginResponse),
        );
        // const payload = {
        //   payload: loginResponse,
        // };

        const payload = createResponse('login successful', loginResponse, true);

        const encryptedResp = await encryptPayload(payload);

        return res
          .status(HttpStatus.OK)
          .json(createEncryptedResponse(encryptedResp));
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
      this.logger.debug(
        'verifyOtp called with payload: ' + JSON.stringify(body),
      );

      if (body && body.code !== '') {
        // const decryptedData = await decryptKms(body.payload);

        // this.logger.debug(
        //   'verifyOtp decrypted payload: ' + JSON.stringify(decryptedData),
        // );

        const authId = res.locals.id;
        // const { code } = decryptedData;

        const { code } = body;

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

  @Post('sendOtp')
  @ApiOperation({
    summary: 'Send OTP to user',
    description: 'Send OTP to user',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        payload: {
          example:
            'AQICAHjLuDRTnKVsgRzvUy74xztM2frynZUHkg/Nv5ZSxXo+PgEfnog+SPjBWqGB',
        },
      },
    },
  })
  @ApiResponse({ status: 200, description: 'OTP sent successfully' })
  @ApiResponse({ status: 400, description: 'Failed to send OTP' })
  async sendOtp(@Body() reqBody: TempUserAccountDto) {
    try {
      const authResponse = await this.authService.sendOtp(
        reqBody.email,
        reqBody.mobile,
      );

      const payload = createResponse(authResponse.message, authResponse.token);

      return payload;
    } catch (error) {
      this.logger.error(
        'Auth Controller with error message: ' + error.message,
        ' with error: ' + error,
      );

      // if its input validation error, throw bad request
      throw new HttpException(
        'send otp failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
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
