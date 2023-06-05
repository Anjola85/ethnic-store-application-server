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
    try {
      const response: any = await this.authService.login(loginDto);

      const userResponse = {
        info: response.user[0],
        encryptedPassword: response.encryptedPassword,
      };

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
    try {
      const result = await this.userController.create(requestBody, res);
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

  // verify otp controller
  // for sign up logic, look below
  // get the temp account of the user with use od
  // transfaer the data to the actual user account.
  // also update the auth account if the password was provided

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
      // check if user exists through either email or phone number
      const userExists = await this.userAccountService.userExists(
        requestBody.email,
        requestBody.mobile.phoneNumber,
      );

      if (userExists) {
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
   * Testing endpoint
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
