import {
  Controller,
  Get,
  Post,
  Body,
  HttpStatus,
  Res,
  Query,
  Logger,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { loginDto } from './dto/login.dto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';
import { EncryptedDTO } from '../../common/dto/encrypted.dto';
import { AwsSecretKey } from 'src/common/util/secret';
import { encryptKms, decryptKms } from '../../common/util/crypto';
import { createError, createResponse } from '../../common/util/response';
import { EncryptionInterceptor } from 'src/interceptors/encryption.interceptor';
import { otpVerifyDto } from './dto/otp-verification.dto';
import { secureLoginDto } from './dto/secure-login.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly userController: UserController;
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly awsSecretKey: AwsSecretKey,
  ) {
    this.userController = new UserController(userService, authService);
  }

  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    // log time of request
    const requestTime = new Date();
    this.logger.log(
      '\n[QuickMart Server] - Request to ** login endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(loginDto),
    );
    try {
      if (body.payload && body.payload !== '') {
        // decrypt request body
        const decryptedData = await decryptKms(body.payload);

        // convert decrypted data to loginDto
        const secLoginDto = new secureLoginDto();
        Object.assign(secLoginDto, decryptedData);

        // call verifyOtp method
        const auth = await this.authService.findByEmailOrMobile(
          secLoginDto.email,
          secLoginDto.mobile,
        );

        const otpVerification = await this.authService.verifyOtp(
          auth.id,
          secLoginDto.code,
          secLoginDto.entryTime,
        );

        if (!otpVerification.status) {
          return res
            .status(HttpStatus.BAD_REQUEST)
            .json(
              createError(
                '400 login failed from auth.controller.ts',
                otpVerification.message,
              ),
            );
        }

        // call login method
        const response: any = await this.authService.login(secLoginDto);
        const { token, ...userResponse } = response;

        // log end time for response
        const endTime = new Date();
        this.logger.log(
          '\n[QuickMart Server] - Response from ** login endpoint ** With endtime: ' +
            endTime +
            ' with status: ' +
            response.status,
        );

        return res.status(HttpStatus.OK).json(
          createResponse(
            response.message,
            {
              token,
              user: userResponse.user,
            },
            response.status,
          ),
        );
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('payload is required'));
      }
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(
            createResponse(
              'login failed from auth.controller.ts',
              error.message,
            ),
          );
      } else {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createError('login failed from auth.controller.ts', error.message),
          );
      }
    }
  }

  @Post('signup')
  async register(@Body() requestBody: any, @Res() res: Response): Promise<any> {
    // log time of request
    const requestTime = new Date();
    this.logger.log(
      '\n[QuickMart Server] - Request to ** signup endpoint ** With starttime: ' +
        requestTime +
        ' and payload: ' +
        JSON.stringify(requestBody),
    );
    try {
      //decrypt request body
      const decryptedBody = await decryptKms(requestBody.payload);

      const authId = res.locals.id;
      const isOtpVerified = await this.authService.verifyOtp(
        authId,
        decryptedBody.code,
        decryptedBody.entryTime,
      );

      if (!isOtpVerified.status) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(
            createError(
              'user registeration failed from auth.controller.ts',
              isOtpVerified.message,
            ),
          );
      }

      const result = await this.userController.create(decryptedBody, res);

      // log end time for response
      const endTime = new Date();
      this.logger.log(
        '\n[QuickMart Server] - Response from ** signup endpoint ** With endtime: ' +
          endTime +
          ' with response ' +
          JSON.stringify(result.message),
      );
      return result;
    } catch (error) {
      // Handle any error that occurs during the registration process
      if (error instanceof InternalServerError) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(
            createError(
              '500 user registeration failed from auth.controller.ts',
              error.message,
            ),
          );
      }
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          createError(
            '400 user registeration failed from auth.controller.ts',
            error.message,
          ),
        );
    }
  }

  @Post('sendOtp')
  async sendOtp(@Body() body: EncryptedDTO, @Res() res: Response) {
    try {
      const requestTime = new Date().toISOString();
      this.logger.log(
        '\n[QuickMart Server] - Request to ** sendOtp endpoint ** With start time: ' +
          requestTime +
          ' and payload: ' +
          JSON.stringify(body),
      );
      // handle decryption of request body
      const decrypted = await decryptKms(body.payload);
      const requestBody = new TempUserAccountDto();
      Object.assign(requestBody, decrypted);

      const authResponse = await this.authService.sendOtp(
        requestBody.email,
        requestBody.mobile,
      );

      // log time of response
      const endTime = new Date().toISOString();
      this.logger.log(
        '[QuickMart Server] - Response from sendOtp endpoint end-time: ' +
          endTime +
          ' with data: ' +
          JSON.stringify(authResponse.message),
      );
      return res
        .status(HttpStatus.OK)
        .json(
          createResponse(authResponse.message, { token: authResponse.token }),
        );
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          createError(
            '400 send otp failed from auth.controller.ts',
            error.message,
          ),
        );
    }
  }

  @Post('sendOTPBySms')
  async sendOTPBySms(@Body() requestBody: any, @Res() res: Response) {
    const { phone_number } = requestBody;
    const requestTime = new Date();
    this.logger.log(
      '\n[QuickMart Server] - Request to ** sendOTPBySms endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(requestBody),
    );
    try {
      await this.authService.sendOTPBySmsTest(phone_number);
      // log repsonse time and response
      const endTime = new Date();
      this.logger.log(
        '[QuickMart Server] - Response from ** sendOTPBySms endpoint ** With endpoint: ' +
          endTime +
          ' with response: ' +
          JSON.stringify({ status: true, message: 'SMS sent successfully.' }),
      );
      return res
        .status(HttpStatus.OK)
        .json(createResponse('SMS sent successfully.'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(createError('Failed to send SMS.', error.message));
    }
  }

  // to be deleted
  @Post('reset')
  async reset(@Query('clear') clear: boolean, @Res() res: Response) {
    const requestTime = new Date();
    this.logger.log(
      '\n[QuickMart Server] - Request to ** sendOTPBySms endpoint ** With starttime: ' +
        requestTime,
    );
    try {
      // take in query param resetType to be true or false
      if (clear === undefined || clear === null) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'clear query param is required',
        });
      } else if (clear === false) {
        return res.status(HttpStatus.OK).json({
          message: 'clear query param must be true in order to reset',
        });
      }
      // reset user account
      const response = await this.authService.deleteRegisteredUsers();
      // log response and the time
      const endTime = new Date();
      this.logger.log(
        '\n[QuickMart Server] - Response from ** reset endpoint ** with endtime: ' +
          endTime +
          ' with response: ' +
          JSON.stringify(response),
      );
      return res.status(HttpStatus.OK).json(createResponse('reset successful'));
    } catch (error) {
      return res
        .status(HttpStatus.BAD_REQUEST)
        .json(
          createError(
            `400 reset failed from auth.controller.ts`,
            error.message,
          ),
        );
    }
  }
}
