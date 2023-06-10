import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  NotFoundException,
  Query,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { UserAccountService } from '../user_account/user_account.service';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly userController: UserController;

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly userAccountService: UserAccountService,
  ) {
    this.userController = new UserController(
      userService,
      userAccountService,
      authService,
    );
  }

  /**
   * Testing route
   * @returns
   */
  @Get('test')
  public test() {
    this.logger.log('\nTest endpoint hit at ' + new Date());
    // log the response of this method and the name of the method and class
    this.logger.log(
      '\nResponse from ** test endpoint ** in ** auth.controller ** With endtime: ' +
        new Date() +
        ' with response: ' +
        '\n' +
        'This is the  test endpoint from the user controller',
    );

    return 'This is the  test endpoint from the user controller';
  }

  /**
   * Login a user
   * @param loginDto
   * @param res
   * @returns {*}
   */
  @Post('login')
  async login(@Body() loginDto: loginDto, @Res() res: Response) {
    // log time of request
    const requestTime = new Date();

    this.logger.log(
      '\nRequest to ** login endpoint ** With starttime: ' + requestTime,
    );

    try {
      const response: any = await this.authService.login(loginDto);

      const userResponse = {
        info: response.user[0],
        encryptedPassword: response.encryptedPassword,
      };

      // log end time for response
      const endTime = new Date();

      this.logger.log(
        '\nResponse from ** login endpoint ** With endtime: ' +
          endTime +
          ' with response ' +
          JSON.stringify(response),
      );

      return res.status(HttpStatus.OK).json({
        message: response.message,
        token: response.token,
        user: userResponse,
      });
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `login failed from auth.controller.ts`,
          error: error.message,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `login failed from auth.controller.ts`,
          error: error.message,
        });
      }
    }
  }

  @Post('signup')
  async register(@Body() requestBody: any, @Res() res: Response): Promise<any> {
    // log time of request
    const requestTime = new Date();

    this.logger.log(
      '\nRequest to ** signup endpoint ** With starttime: ' + requestTime,
    );

    try {
      const result = await this.userController.create(requestBody, res);

      // log end time for response
      const endTime = new Date();

      this.logger.log(
        '\nResponse from ** signup endpoint ** With endtime: ' +
          endTime +
          ' with response ' +
          JSON.stringify(result.message),
      );
      return result;
    } catch (error) {
      // Handle any error that occurs during the registration process
      if (error instanceof InternalServerError) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `500 user registeration failed from auth.controller.ts`,
          error: error.message,
        });
      }
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 user registeration failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  /**
   * Verify the OTP sent, update the auth collection
   * @param body
   * @param res
   * @returns {*}
   */
  @Post('verifyOtp')
  async confirmOtp(
    @Body() body: { code: string; entryTime: Date },
    @Res() res: Response,
  ) {
    try {
      const userId = res.locals.userId;

      const response: { message: string; verified: boolean } =
        await this.authService.verifyOtp(body.code, body.entryTime, userId);

      return res.status(HttpStatus.OK).json({
        message: response.message,
        verified: response.verified,
      });
    } catch (error) {
      if (error instanceof InternalServerError) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: `500 confirm otp failed from auth.controller.ts`,
          error: error.message,
        });
      } else {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: `400 confirm otp failed from auth.controller.ts`,
          error: error.message,
        });
      }
    }
  }

  /**
   * This sends otp to the user's email or phone number
   * and creates a temporary user account and auth account for the user
   * @param requestBody
   * @param res
   * @returns {jwt; message}
   */
  @Post('sendOtp')
  async sendOtp(@Body() requestBody: TempUserAccountDto, @Res() res: Response) {
    try {
      // log time of request
      const requestTime = new Date();

      this.logger.log(
        '\nRequest to ** sendOtp endpoint ** With starttime: ' + requestTime,
      );

      // check if user exists through either email or phone number
      const userExists = await this.userAccountService.userExists(
        requestBody.email,
        requestBody.mobile,
      );

      // check if user exists in temp user account
      const tempUserExists = await this.userAccountService.tempUserExists(
        requestBody.email,
        requestBody.mobile,
      );

      if (userExists || tempUserExists) {
        return res.status(HttpStatus.CONFLICT).json({
          message: 'user already exists',
        });
      }

      // create temporary user account
      const userAccount = await this.userAccountService.createTempUserAccount(
        requestBody,
      );

      // create auth for user
      const authDto = new CreateAuthDto();
      authDto.email = requestBody.email;
      authDto.mobile = requestBody.mobile;

      const authResponse = await this.authService.create(
        authDto,
        userAccount.id,
      );

      // log time of response
      const endTime = new Date();

      this.logger.log(
        'Response to sendOtp endpoint end-time: ' +
          endTime +
          ' with data: ' +
          JSON.stringify(authResponse.message),
      );

      return res.status(HttpStatus.OK).json({
        message: authResponse.message,
        token: authResponse.token,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 send otp failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  // resend otp controller
  @Post('resendOtp')
  async resendOtp(
    @Body() requestBody: TempUserAccountDto,
    @Res() res: Response,
  ) {
    // log time of request
    const requestTime = new Date();
    this.logger.log(
      '\nRequest to ** sendOtp endpoint ** With starttime: ' + requestTime,
    );

    try {
      const userId = res.locals.userId;

      // get user by email or phone number
      const userAccount = await this.userAccountService.findUserInTempAccount(
        userId,
      );

      if (userAccount === null || userAccount === undefined) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'user not found',
        });
      }

      // resend otp
      const authResponse = await this.authService.resendOtp(
        userAccount.id,
        requestBody.email,
        requestBody.mobile.phoneNumber,
      );

      const logResponse = {
        message: authResponse.message,
        expiryTime: authResponse.expiryTime,
      };

      // log time of request
      const endTime = new Date();
      this.logger.log(
        '\nRequest to ** sendOtp endpoint ** With endpoint: ' +
          endTime +
          ' with response: ' +
          JSON.stringify(logResponse),
      );

      return res.status(HttpStatus.OK).json({
        message: authResponse.message,
        token: authResponse.token,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 resend otp failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  /**
   * This endpint is to test the sendOTPBySms method
   * This endpoint sends an OTP code to the user's phone number.
   * @param requestBody
   * @returns
   */
  @Post('sendOTPBySms')
  async sendOTPBySms(@Body() requestBody: any) {
    const { phoneNumber } = requestBody;
    try {
      await this.authService.sendOTPBySmsTest(phoneNumber);
      return { success: true, message: 'SMS sent successfully.' };
    } catch (error) {
      return { success: false, message: 'Failed to send SMS.' };
    }
  }

  /**
   * TODO: To be deleted
   * THis endpoint is to test the sendOTPByEmail method
   * @param reset
   * @param res
   * @returns
   */
  @Post('reset')
  async reset(@Query('reset') reset: boolean, @Res() res: Response) {
    try {
      // take in query param resetType to be true or false
      if (reset === undefined || reset === null) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'reset query param is required',
        });
      } else if (reset === false) {
        return res.status(HttpStatus.OK).json({
          message: 'reset query param must be true in order to reset',
        });
      }

      // reset user account
      this.authService.resetRegisteredUsers();

      return res.status(HttpStatus.OK).json({
        message: 'reset successful',
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 reset failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  @Post()
  async create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.create(createAuthDto, '');
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
