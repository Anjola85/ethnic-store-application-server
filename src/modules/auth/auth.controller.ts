import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Logger,
  UseInterceptors,
  HttpException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
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
import { SecureLoginDto } from './dto/secure-login.dto';
import { ApiBody, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UserDto } from '../user/dto/user.dto';
import {
  decryptKms,
  encryptKms,
  encryptPayload,
  toBuffer,
} from 'src/common/util/crypto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { VerifyOtpDto } from './dto/otp-verification.dto';
import { NotFoundError } from 'rxjs';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authService: AuthService,
    private readonly awsSecretKey: AwsSecretKey,
    private readonly geocodingService: GeocodingService,
  ) {}

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

      if (error instanceof ConflictException)
        throw new HttpException(error.message, HttpStatus.CONFLICT);

      throw new HttpException(
        'send otp failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Verifies the otp
   * @param body
   * @param res
   * @returns
   */
  @Post('verifyOtp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    try {
      const { authId, code } = body;

      const isOtpVerified = await this.authService.verifyOtp(authId, code);

      if (!isOtpVerified.status)
        throw new HttpException(isOtpVerified.message, HttpStatus.BAD_REQUEST);

      const payload = createResponse('otp verification successful');
      return payload;
    } catch (error) {
      this.logger.debug('Auth Controller with error: ' + error);

      if (error instanceof UnauthorizedException)
        throw new HttpException(error.message, HttpStatus.UNAUTHORIZED);

      throw new HttpException(
        'verify otp failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: SecureLoginDto) {
    try {
      const loginResponse = await this.authService.login(loginDto);

      const payload = createResponse('login successful', loginResponse, true);

      return payload;
    } catch (error) {
      if (error instanceof HttpException) {
        this.logger.debug('Auth Controller with error: ' + error);
        throw new HttpException(error.message, error.getStatus());
      } else {
        this.logger.debug(
          'Auth Controller with internal server error, details:' + error,
        );

        throw new HttpException(
          "Something went wrong, we're working on it",
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
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
      console.log('data to encrypt: ' + JSON.stringify(data, null, 2));
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
