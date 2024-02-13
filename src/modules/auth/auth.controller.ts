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
  Get,
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
  decryptPayload,
  encryptKms,
  encryptPayload,
  toBuffer,
} from 'src/common/util/crypto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { VerifyOtpDto } from './dto/otp-verification.dto';
import { NotFoundError } from 'rxjs';
import { LoginOtpRequest } from 'src/contract/version1/request/auth/loginOtp.request';
import { OtpPayloadResp } from 'src/contract/version1/response/otp-response.dto';

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
      this.logger.debug(
        'SendOTP endpoint called with request body: ' +
          JSON.stringify(reqBody, null, 2),
      );
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
      this.logger.debug(
        'VerifyOTP endpoint called with request body: ' +
          JSON.stringify(body, null, 2),
      );
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

  @Post('request-login')
  async loginOtpRequest(@Body() body: LoginOtpRequest) {
    try {
      this.logger.debug(
        'LoginOTPRequest endpoint called with request body: ' +
          JSON.stringify(body, null, 2),
      );

      const resp: OtpPayloadResp = await this.authService.loginOtpRequest(body);

      const payload = createResponse(resp.message, resp.token);

      return payload;
    } catch (error) {
      this.logger.debug('Auth Controller with error: ' + error);

      if (error instanceof NotFoundError) {
        throw new HttpException(error.message, HttpStatus.NOT_FOUND);
      }

      throw new HttpException(
        "Something went wrong, we're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('login')
  async login(@Body() loginDto: SecureLoginDto) {
    try {
      this.logger.debug(
        'Login endpoint called with request body: ' +
          JSON.stringify(loginDto, null, 2),
      );

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
  async encrypt(@Body() requestBody: any): Promise<any> {
    try {
      const data = requestBody.payload;
      // console.log('data to encrypt: ' + JSON.stringify(data, null, 2));
      const encryptedData = await encryptPayload(data);
      const resp = createResponse('encryption successful', encryptedData);
      return resp;
    } catch (error) {
      throw new HttpException(
        'encryption failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('decrypt')
  async decrypt(@Body() requestBody: any, @Res() res: Response) {
    try {
      const decryptedData = await decryptPayload(requestBody.payload);
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

  // api to delete all records on auth, user, mobile and address
  @Get('delete')
  async deleteAllRecords() {
    try {
      await this.authService.deleteAllRecords();
      return createResponse('delete successful');
    } catch (error) {
      throw new HttpException(
        'delete failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
