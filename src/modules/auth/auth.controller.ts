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
import { Response, response } from 'express';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { loginDto } from './dto/login.dto';
import { InternalServerError } from '@aws-sdk/client-dynamodb';
import { UserController } from '../user/user.controller';
import { UserService } from '../user/user.service';
import { UserAccountService } from '../user_account/user_account.service';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';
import * as AWS from 'aws-sdk';
// import {
//   SecretsManagerClient,
//   GetSecretValueCommand,
// } from '@aws-sdk/client-secrets-manager';
import * as crypto from 'crypto';

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
  public test(@Res() res: Response) {
    this.logger.log(
      '\n[QuickMart Server] - Request to test endpoint at ' + new Date(),
    );
    // log the response of this method and the name of the method and class
    this.logger.log(
      '\n[QuickMart Server] - Response from ** test endpoint ** in ** auth.controller ** With endtime: ' +
        new Date() +
        ' with response: ' +
        '\n' +
        'This is the  test endpoint from the user controller',
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'This is the  test endpoint from AUTH on QUICKMART!!!!',
    });
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
      '\n[QuickMart Server] - Request to ** login endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(loginDto),
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
        '\n[QuickMart Server] - Response from ** login endpoint ** With endtime: ' +
          endTime +
          ' with response body ' +
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
      '\n[QuickMart Server] - Request to ** signup endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(requestBody),
    );

    try {
      const result = await this.userController.create(requestBody, res);

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
    @Body() body: { code: string; entryTime: string },
    @Res() res: Response,
  ) {
    // log the time of request and body of request
    const requestTime = new Date();

    this.logger.log(
      '\n[QuickMart Server] - Request to ** verifyOtp endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(body),
    );

    try {
      const userId = res.locals.userId;

      const response: { message: string; verified: boolean } =
        await this.authService.verifyOtp(body.code, body.entryTime, userId);

      // log the time of response and body of response
      const endTime = new Date();

      this.logger.log(
        '\n[QuickMart Server] - Response from ** verifyOtp endpoint ** With endtime: ' +
          endTime +
          ' with response body ' +
          JSON.stringify(response),
      );

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
        '\n[QuickMart Server] - Request to ** sendOtp endpoint ** With starttime: ' +
          requestTime +
          ' with payload: ' +
          JSON.stringify(requestBody),
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
        '[QuickMart Server] - Response from sendOtp endpoint end-time: ' +
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
      '\n[QuickMart Server] - Request to ** resendOtp endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(requestBody),
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
        '[QuickMart Server] - Response from ** resendOtp endpoint ** With endpoint: ' +
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

    const requestTime = new Date();

    this.logger.log(
      '\n[QuickMart Server] - Request to ** sendOTPBySms endpoint ** With starttime: ' +
        requestTime +
        ' with payload: ' +
        JSON.stringify(requestBody),
    );

    try {
      await this.authService.sendOTPBySmsTest(phoneNumber);

      // log repsonse time and response
      const endTime = new Date();
      this.logger.log(
        '[QuickMart Server] - Response from ** sendOTPBySms endpoint ** With endpoint: ' +
          endTime +
          ' with response: ' +
          JSON.stringify({ success: true, message: 'SMS sent successfully.' }),
      );

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
      const response = await this.authService.resetRegisteredUsers();

      // log response and the time
      const endTime = new Date();
      this.logger.log(
        '\n[QuickMart Server] - Response from ** reset endpoint ** with endtime: ' +
          endTime +
          ' with response: ' +
          JSON.stringify(response.message),
      );

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

  // convert plainText key
  private async convertPlainTextKey(plainTextKey: any): Promise<Buffer> {
    let key;

    if (typeof plainTextKey === 'string') {
      key = plainTextKey;
    } else if (
      plainTextKey instanceof Buffer ||
      plainTextKey instanceof Uint8Array
    ) {
      key = plainTextKey;
    } else if (plainTextKey instanceof Blob) {
      key = await plainTextKey.arrayBuffer();
      key = Buffer.from(key);
    } else {
      // log the error
      this.logger.log(
        '\nUnknow type of Plaintext from kmsClient.generateDataKey()',
      );
      throw new Error('Unknow type of Plaintext from kmsClient');
    }

    return key;
  }

  private encryptData(key: Buffer, data: any) {
    const iv = Buffer.from('00000000000000000000000000000000', 'hex');
    const algorithm = 'AES-256-CBC';

    // create encryptor
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encryptedData = cipher.update(data, 'utf8', 'hex');

    encryptedData += cipher.final('hex');

    return encryptedData;
  }

  private decryptData(key: Buffer, cipherText: string) {
    const iv = Buffer.from('00000000000000000000000000000000', 'hex');
    const algorithm = 'AES-256-CBC';

    const decipher = crypto.createDecipheriv(algorithm, key, iv);

    let decryptedData = decipher.update(cipherText, 'hex', 'utf-8');

    decryptedData += decipher.final('utf8');

    return decryptedData;
  }

  // test encryption endpoint
  @Post('encrypt')
  async encrypt(@Body() requestBody: any, @Res() res: Response) {
    try {
      const key = await this.getSecretKey();

      const payload = requestBody.payload;

      const encryptedData = this.encryptData(Buffer.from(key, 'hex'), payload);

      return res.status(HttpStatus.OK).json({
        message: 'encryption successful',
        payload: { encryptedData },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 encrypt failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  // test decryption endpoint -- TODO: this will get the key from the enviroment.
  @Post('decrypt')
  async decrypt(@Body() requestBody: any, @Res() res: Response) {
    try {
      const { Plaintext } = await this.generateEncryptedDataKey();

      const key: Buffer = await this.convertPlainTextKey(Plaintext);

      const clearData = this.decryptData(key, requestBody.payload);

      return res.status(HttpStatus.OK).json({
        message: 'decryption successful',
        payload: { clearData },
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        message: `400 decrypt failed from auth.controller.ts`,
        error: error.message,
      });
    }
  }

  private async generateEncryptedDataKey() {
    try {
      // create kms client
      const kmsClient = new AWS.KMS({
        region: 'us-east-1',
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      const params = {
        KeyId: process.env.AWS_KMS_KEY_ID,
        KeySpec: 'AES_256',
      };

      const key = await kmsClient.generateDataKey(params).promise();

      return key;
    } catch (error) {
      throw new Error(
        'Error in generating encrypted data key from kmsClient.generateDataKey()',
      );
    }
  }

  // retrieve secret from AWS Secrets Manager. TODO - make this a method to load the env variables on build of the server
  private async getSecretKey() {
    try {
      let key;

      const secret_name = 'payload-key';

      const client = new AWS.SecretsManager({
        region: 'us-east-1',
        // accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        // secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      const data = await client
        .getSecretValue({ SecretId: secret_name })
        .promise();

      if ('SecretString' in data) {
        const secret = JSON.parse(data.SecretString);
        key = secret.key;
      } else {
        throw new Error('Unable to retrieve key');
      }

      return key;
    } catch (err) {
      console.error('Error retrieving secret from AWS:', err);
      throw new Error('Error retrieving secret from AWS');
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
