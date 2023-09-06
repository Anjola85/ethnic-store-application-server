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
import { UserAccountService } from '../user_account/user_account.service';
import { TempUserAccountDto } from '../user_account/dto/temporary-user-account.dto';
import { EncryptedDTO } from '../../common/dto/encrypted.dto';
import { AwsSecretKey } from 'src/common/util/secret';
import { encryptKms, decryptKms } from '../../common/util/crypto';
import { createError, createResponse } from '../../common/util/response';
import { EncryptionInterceptor } from 'src/interceptors/encryption.interceptor';

@Controller('auth')
export class AuthController {
  // private readonly logger = new Logger(AuthController.name);
  // private readonly userController: UserController;
  // constructor(
  //   private readonly authService: AuthService,
  //   private readonly userService: UserService,
  //   private readonly userAccountService: UserAccountService,
  //   private readonly awsSecretKey: AwsSecretKey,
  // ) {
  //   this.userController = new UserController(
  //     userService,
  //     userAccountService,
  //     authService,
  //   );
  // }
  // /**
  //  * Testing route
  //  * @returns
  //  */
  // @Get('test')
  // public test(@Res() res: Response) {
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to test endpoint at ' + new Date(),
  //   );
  //   // log the response of this method and the name of the method and class
  //   this.logger.log(
  //     '\n[QuickMart Server] - Response from ** test endpoint ** in ** auth.controller ** With endtime: ' +
  //       new Date() +
  //       ' with response: ' +
  //       '\n' +
  //       'This is the  test endpoint from the user controller',
  //   );
  //   return res
  //     .status(HttpStatus.OK)
  //     .json(
  //       createResponse('This is the  test endpoint from AUTH on QUICKMART!!!!'),
  //     );
  // }
  // /**
  //  * Login a user
  //  * @param loginDto
  //  * @param res
  //  * @returns {*}
  //  */
  // @Post('login')
  // async login(@Body() body: any, @Res() res: Response) {
  //   // log time of request
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** login endpoint ** With starttime: ' +
  //       requestTime +
  //       ' with payload: ' +
  //       JSON.stringify(loginDto),
  //   );
  //   try {
  //     if (body.payload && body.payload !== '') {
  //       // decrypt request body
  //       const decryptedData = await decryptKms(body.payload);
  //       // convert decrypted data to loginDto
  //       const requestBody = new loginDto();
  //       Object.assign(requestBody, decryptedData);
  //       const response: any = await this.authService.login(requestBody);
  //       const { token, ...userResponse } = response;
  //       // log end time for response
  //       const endTime = new Date();
  //       this.logger.log(
  //         '\n[QuickMart Server] - Response from ** login endpoint ** With endtime: ' +
  //           endTime +
  //           ' with status: ' +
  //           response.status,
  //       );
  //       return res.status(HttpStatus.OK).json(
  //         createResponse(
  //           response.message,
  //           {
  //             token,
  //             user: userResponse.user,
  //           },
  //           response.status,
  //         ),
  //       );
  //     } else {
  //       return res
  //         .status(HttpStatus.BAD_REQUEST)
  //         .json(createError('payload is required'));
  //     }
  //   } catch (error) {
  //     if (error instanceof InternalServerError) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json(
  //           createResponse(
  //             'login failed from auth.controller.ts',
  //             error.message,
  //           ),
  //         );
  //     } else {
  //       return res
  //         .status(HttpStatus.BAD_REQUEST)
  //         .json(
  //           createError('login failed from auth.controller.ts', error.message),
  //         );
  //     }
  //   }
  // }
  // @Post('signup')
  // async register(@Body() requestBody: any, @Res() res: Response): Promise<any> {
  //   // log time of request
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** signup endpoint ** With starttime: ' +
  //       requestTime +
  //       ' with payload: ' +
  //       JSON.stringify(requestBody),
  //   );
  //   try {
  //     //decrypt request body
  //     const decryptedBody = await decryptKms(requestBody.payload);
  //     const result = await this.userController.create(decryptedBody, res);
  //     console.log('done creatings');
  //     // log end time for response
  //     const endTime = new Date();
  //     this.logger.log(
  //       '\n[QuickMart Server] - Response from ** signup endpoint ** With endtime: ' +
  //         endTime +
  //         ' with response ' +
  //         JSON.stringify(result.message),
  //     );
  //     return result;
  //   } catch (error) {
  //     // Handle any error that occurs during the registration process
  //     if (error instanceof InternalServerError) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json(
  //           createError(
  //             '500 user registeration failed from auth.controller.ts',
  //             error.message,
  //           ),
  //         );
  //     }
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(
  //         createError(
  //           '400 user registeration failed from auth.controller.ts',
  //           error.message,
  //         ),
  //       );
  //   }
  // }
  // /**
  //  * Verify the OTP sent, update the auth collection
  //  * @param body
  //  * @param res
  //  * @returns {*}
  //  */
  // @Post('verifyOtp')
  // async confirmOtp(
  //   @Body() body: { code: string; entryTime: string },
  //   @Res() res: Response,
  // ) {
  //   // log the time of request and body of request
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** verifyOtp endpoint ** With starttime: ' +
  //       requestTime +
  //       ' with payload: ' +
  //       JSON.stringify(body),
  //   );
  //   try {
  //     const userId = res.locals.userId;
  //     const response: { message: string; status: boolean } =
  //       await this.authService.verifyOtp(body.code, body.entryTime, userId);
  //     // log the time of response and body of response
  //     const endTime = new Date();
  //     this.logger.log(
  //       '\n[QuickMart Server] - Response from ** verifyOtp endpoint ** With endtime: ' +
  //         endTime +
  //         ' with response body ' +
  //         JSON.stringify(response),
  //     );
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(createResponse(response.message, null, response.status));
  //   } catch (error) {
  //     if (error instanceof InternalServerError) {
  //       return res
  //         .status(HttpStatus.INTERNAL_SERVER_ERROR)
  //         .json(
  //           createError(
  //             '500 confirm otp failed from auth.controller.ts',
  //             error.message,
  //           ),
  //         );
  //     } else {
  //       return res
  //         .status(HttpStatus.BAD_REQUEST)
  //         .json(
  //           createError(
  //             '400 confirm otp failed from auth.controller.ts',
  //             error.message,
  //           ),
  //         );
  //     }
  //   }
  // }
  // /**
  //  * This sends otp to the user's email or phone number
  //  * and creates a temporary user account and auth account for the user
  //  * @param requestBody
  //  * @param res
  //  * @returns {jwt; message}
  //  */
  // @Post('sendOtp')
  // async sendOtp(@Body() body: EncryptedDTO, @Res() res: Response) {
  //   try {
  //     const requestTime = new Date().toISOString();
  //     this.logger.log(
  //       '\n[QuickMart Server] - Request to ** sendOtp endpoint ** With start time: ' +
  //         requestTime +
  //         ' with payload: ' +
  //         JSON.stringify(body),
  //     );
  //     // handle decryption of request body
  //     const decrypted = await decryptKms(body.payload);
  //     const requestBody = new TempUserAccountDto();
  //     Object.assign(requestBody, decrypted);
  //     // console.log('body: ', requestBody.email);
  //     // check if user account exists
  //     const userAccountId: string | null =
  //       await this.userAccountService.getUserId(
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //     let authResponse;
  //     // check if user exists in temp user account (meaning user has already started registeration)
  //     const tempUserAcctId: string | null =
  //       await this.userAccountService.getTempUserId(
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //     let firstTimeReg = true;
  //     if (tempUserAcctId !== null) {
  //       firstTimeReg = false;
  //     }
  //     if (firstTimeReg && !userAccountId) {
  //       // create temporary user account
  //       const userAccount = await this.userAccountService.createTempUserAccount(
  //         requestBody,
  //       );
  //       // save info in new auth record
  //       const authDto = new CreateAuthDto();
  //       // save auth info depending on what was sent
  //       if (requestBody.email) {
  //         authDto.email = requestBody.email;
  //       } else if (requestBody.mobile) {
  //         authDto.mobile = requestBody.mobile;
  //       }
  //       authResponse = await this.authService.create(authDto, userAccount.id);
  //     } else if (!firstTimeReg && !userAccountId) {
  //       const otpResp = await this.authService.sendOTP(
  //         tempUserAcctId,
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //       // update auth with new otp
  //       this.authService.updateAuthOtp(
  //         tempUserAcctId,
  //         otpResp.code,
  //         otpResp.expiryTime,
  //       );
  //       authResponse = otpResp;
  //     } else if (!firstTimeReg && userAccountId) {
  //       // just send otp to user
  //       const otpResp = await this.authService.sendOTP(
  //         userAccountId,
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //       this.authService.updateAuthOtp(
  //         tempUserAcctId,
  //         otpResp.code,
  //         otpResp.expiryTime,
  //       );
  //     } else {
  //       // an error occured
  //       return res
  //         .status(HttpStatus.BAD_REQUEST)
  //         .json(createResponse('an error occured sending otp', null, false));
  //     }
  //     // log time of response
  //     const endTime = new Date().toISOString();
  //     this.logger.log(
  //       '[QuickMart Server] - Response from sendOtp endpoint end-time: ' +
  //         endTime +
  //         ' with data: ' +
  //         JSON.stringify(authResponse.message),
  //     );
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(
  //         createResponse(authResponse.message, { token: authResponse.token }),
  //       );
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(
  //         createError(
  //           '400 send otp failed from auth.controller.ts',
  //           error.message,
  //         ),
  //       );
  //   }
  // }
  // @Post('resendOtp')
  // async resendOtp(@Body() body: EncryptedDTO, @Res() res: Response) {
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** resendOtp endpoint ** With starttime: ' +
  //       requestTime +
  //       ' with payload: ' +
  //       JSON.stringify(body),
  //   );
  //   try {
  //     // decrypt request body
  //     const decrypted = await decryptKms(body.payload);
  //     const requestBody = new TempUserAccountDto();
  //     Object.assign(requestBody, decrypted);
  //     // check if user account already exists
  //     let userId: string | null = await this.userAccountService.getUserId(
  //       requestBody.email,
  //       requestBody.mobile,
  //     );
  //     if (!userId) {
  //       // repalce the userID with the temp user id
  //       userId = await this.userAccountService.getTempUserId(
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //     }
  //     if (!userId) {
  //       return res.status(HttpStatus.NOT_FOUND).json({
  //         message: 'User not found, unable to send otp',
  //       });
  //     } else {
  //       const otpResp = await this.authService.resendOtp(
  //         userId,
  //         requestBody.email,
  //         requestBody.mobile,
  //       );
  //       this.authService.updateAuthOtp(
  //         userId,
  //         otpResp.code,
  //         otpResp.expiryTime,
  //       );
  //       const logResponse = {
  //         message: otpResp.message,
  //         expiryTime: otpResp.expiryTime,
  //       };
  //       // log time of request
  //       const endTime = new Date();
  //       this.logger.log(
  //         '[QuickMart Server] - Response from ** resendOtp endpoint ** With endpoint: ' +
  //           endTime +
  //           ' with response: ' +
  //           JSON.stringify(logResponse),
  //       );
  //       return res.status(HttpStatus.OK).json(
  //         createResponse(
  //           otpResp.message,
  //           {
  //             token: otpResp.token,
  //           },
  //           otpResp.status,
  //         ),
  //       );
  //     }
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(
  //         createError(
  //           '400 resend otp failed from auth.controller.ts',
  //           error.message,
  //         ),
  //       );
  //   }
  // }
  // /**
  //  * This endpint is to test the sendOTPBySms method
  //  * This endpoint sends an OTP code to the user's phone number.
  //  * @param requestBody
  //  * @returns
  //  */
  // @Post('sendOTPBySms')
  // async sendOTPBySms(@Body() requestBody: any, @Res() res: Response) {
  //   const { phoneNumber } = requestBody;
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** sendOTPBySms endpoint ** With starttime: ' +
  //       requestTime +
  //       ' with payload: ' +
  //       JSON.stringify(requestBody),
  //   );
  //   try {
  //     await this.authService.sendOTPBySmsTest(phoneNumber);
  //     // log repsonse time and response
  //     const endTime = new Date();
  //     this.logger.log(
  //       '[QuickMart Server] - Response from ** sendOTPBySms endpoint ** With endpoint: ' +
  //         endTime +
  //         ' with response: ' +
  //         JSON.stringify({ status: true, message: 'SMS sent successfully.' }),
  //     );
  //     return res
  //       .status(HttpStatus.OK)
  //       .json(createResponse('SMS sent successfully.'));
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(createError('Failed to send SMS.', error.message));
  //   }
  // }
  // /**
  //  * TODO: To be deleted later
  //  * THis endpoint is to test the sendOTPByEmail method
  //  * @param reset
  //  * @param res
  //  * @returns
  //  */
  // @Post('reset')
  // async reset(@Query('clear') clear: boolean, @Res() res: Response) {
  //   const requestTime = new Date();
  //   this.logger.log(
  //     '\n[QuickMart Server] - Request to ** sendOTPBySms endpoint ** With starttime: ' +
  //       requestTime,
  //   );
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
  //     const response = await this.authService.resetRegisteredUsers();
  //     // log response and the time
  //     const endTime = new Date();
  //     this.logger.log(
  //       '\n[QuickMart Server] - Response from ** reset endpoint ** with endtime: ' +
  //         endTime +
  //         ' with response: ' +
  //         JSON.stringify(response.message),
  //     );
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
  // // remove - for testing
  // @Post('encrypt')
  // async encrypt(@Body() requestBody: any, @Res() res: Response): Promise<any> {
  //   try {
  //     const data = requestBody.payload;
  //     // convert data to buffer
  //     const buffer: Buffer = this.toBuffer(data);
  //     const encryptedData = await encryptKms(buffer);
  //     return res.status(HttpStatus.OK).json({
  //       status: true,
  //       data: encryptedData.toString('hex'),
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       status: false,
  //       message: `400 encrypt failed from auth.controller.ts`,
  //       error: error.message,
  //     });
  //   }
  // }
  // // remove
  // private toBuffer(data: any) {
  //   let buffer: Buffer;
  //   if (typeof data === 'string') {
  //     buffer = Buffer.from(data);
  //   } else if (typeof data === 'object' && data !== null) {
  //     const json = JSON.stringify(data);
  //     buffer = Buffer.from(json);
  //   } else {
  //     throw new Error('Invalid data type. Expected string or object.');
  //   }
  //   return buffer;
  // }
  // // for testing
  // @Post('decrypt')
  // async decrypt(@Body() requestBody: any, @Res() res: Response) {
  //   try {
  //     const decryptedData = await decryptKms(requestBody.payload);
  //     return res.status(HttpStatus.OK).json({
  //       status: true,
  //       data: decryptedData,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.BAD_REQUEST).json({
  //       status: false,
  //       message: `400 decrypt failed from auth.controller.ts`,
  //       error: error.message,
  //     });
  //   }
  // }
  // // reset password
  // @Post()
  // async create(@Body() createAuthDto: CreateAuthDto, @Res() res: Response) {
  //   try {
  //     const resp = await this.authService.create(createAuthDto, '');
  //     return res
  //       .status(HttpStatus.CREATED)
  //       .json(createResponse(resp.message, { token: resp.token }));
  //   } catch (error) {
  //     return res
  //       .status(HttpStatus.BAD_REQUEST)
  //       .json(
  //         createError(
  //           '400 create failed from auth.controller.ts',
  //           error.message,
  //         ),
  //       );
  //   }
  // }
}
