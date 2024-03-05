import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  Logger,
  HttpException,
  UnauthorizedException,
  ConflictException,
  UseInterceptors,
  UploadedFiles,
  Patch,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AwsSecretKey } from 'src/common/util/secret';
import { createResponse } from '../../common/util/response';
import { SecureLoginDto } from './dto/secure-login.dto';
import { ApiResponse } from '@nestjs/swagger';
import { decryptPayload, encryptPayload } from 'src/common/util/crypto';
import { GeocodingService } from '../geocoding/geocoding.service';
import { VerifyOtpDto } from './dto/otp-verification.dto';
import { NotFoundError } from 'rxjs';
import { LoginOtpRequest } from 'src/contract/version1/request/auth/loginOtp.request';
import { AuthOtppRespDto } from 'src/contract/version1/response/otp-response.dto';
import { SignupOtpRequest } from 'src/contract/version1/request/auth/signupOtp.request';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { EncryptedDTO } from 'src/common/dto/encrypted.dto';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginRespDto } from 'src/contract/version1/response/login-response.dto';
import { SignupRespDto } from 'src/contract/version1/response/signup-response.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly authService: AuthService,
    private readonly awsSecretKey: AwsSecretKey,
    private readonly geocodingService: GeocodingService,
  ) {}

  @Post('request-login')
  async loginOtpRequest(@Body() body: LoginOtpRequest) {
    try {
      this.logger.debug(
        'LoginOTPRequest endpoint called with request body: ' +
          JSON.stringify(body),
      );
      const resp: AuthOtppRespDto = await this.authService.loginOtpRequest(
        body,
      );

      return createResponse(resp.message, resp.token);
    } catch (error) {
      this.logger.debug('Auth Controller with error: ' + error);

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "Something went wrong, we're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('request-signup')
  async SignupOtpRequest(@Body() body: SignupOtpRequest) {
    try {
      this.logger.debug(
        'request-signup endpoint called with body: ' + JSON.stringify(body),
      );
      const resp: AuthOtppRespDto = await this.authService.signupOtpRequest(
        body,
      );

      return createResponse(resp.message, resp.token);
    } catch (error) {
      this.logger.error(
        "Error occurred in 'SignupOtpRequest' method of auth.controller.ts with error: " +
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

  /**
   * Registers a user to the DB
   * @param body - request passed by the user
   * @returns {*}
   */
  @Post('signup')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profileImage', maxCount: 1 }]),
  )
  @ApiResponse({ status: 400, description: 'Bad Request.' })
  async registerUser(
    @Body() body: CreateUserDto,
    @UploadedFiles() files: any,
  ): Promise<any> {
    try {
      this.logger.debug('signup endpoint called');

      // body.profileImage = files?.profileImage[0] || null;
      // body.profileImage = files?.backgroundImagee[0] || null;

      const response: SignupRespDto = await this.authService.registerUser(body);

      return createResponse('user successfully registered', response);
    } catch (error) {
      this.logger.error(
        "Error occurred in 'registerUser' method of auth.controller.ts with error: " +
          error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerError(error.message);
    }
  }

  /**
   * Verifies the otp
   * @param body
   * @param res
   * @returns
   */
  @Post('verifyOtp')
  async verifyOtp(@Body() body: VerifyOtpDto, @Res() res: Response) {
    try {
      this.logger.debug('VerifyOTP endpoint called');
      const { code } = body;

      const authId = res.locals.authId;
      const cryptoresp = res.locals.cryptoresp;

      if (!authId)
        throw new UnauthorizedException('authId not found in request');

      const isOtpVerified = await this.authService.verifyOtp(authId, code);

      if (!isOtpVerified.status)
        throw new HttpException(isOtpVerified.message, HttpStatus.BAD_REQUEST);

      const clearResp = createResponse('otp verification successful');

      if (cryptoresp === 'false')
        return res.status(HttpStatus.OK).json(clearResp);

      const encryptedData = await encryptPayload(clearResp);

      const encryptedRespsone: EncryptedDTO = {
        payload: encryptedData,
      };

      return res.status(HttpStatus.OK).json(encryptedRespsone);
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
  async loginUser(@Body() loginDto: SecureLoginDto, @Res() res: Response) {
    try {
      this.logger.debug('Login endpoint called');

      console.log('recievd objcet: ', loginDto);

      const authId = res.locals.authId;
      const cryptoresp = res.locals.cryptoresp;

      if (!authId)
        throw new UnauthorizedException('Unable to retrieve authId from token');

      const isOtpVerified = await this.authService.verifyOtp(
        authId,
        loginDto.code,
      );

      if (!isOtpVerified.status)
        throw new HttpException(isOtpVerified.message, HttpStatus.BAD_REQUEST);

      const loginResponse: LoginRespDto = await this.authService.loginUser(
        loginDto,
        authId,
      );

      const clearResponse = createResponse('login successful', loginResponse);

      if (cryptoresp === 'false')
        return res.status(HttpStatus.OK).json(clearResponse);

      const encryptedData = await encryptPayload(clearResponse);

      const encryptedResp: EncryptedDTO = {
        payload: encryptedData,
      };

      return res.status(HttpStatus.OK).json(encryptedResp);
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

  @Post('register-email')
  async registerEmail(@Body() body: any, @Res() res: Response) {
    try {
      if (!body.email)
        throw new HttpException('email is required', HttpStatus.BAD_REQUEST);

      const email = body.email;

      this.logger.debug('register email endpoint called');
      const authId = res.locals.authId;
      await this.authService.updateAuthWithEmail(email, authId);
      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('email registered'));
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }

      throw new HttpException(
        'register email failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
