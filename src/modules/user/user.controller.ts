import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Patch,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Response } from 'express';
import { AuthService } from '../auth/auth.service';
import {
  createEncryptedResponse,
  createError,
  createResponse,
  handleCustomResponse,
} from '../../common/util/response';
import { encryptPayload } from 'src/common/util/crypto';
import { UserRespDto } from 'src/contract/version1/response/user-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProcessor } from './user.processor';
import { User } from './entities/user.entity';
import { MobileService } from '../mobile/mobile.service';
import { Mobile } from '../mobile/mobile.entity';
import { AddressDto } from '../address/dto/address.dto';
import { AddressService } from '../address/address.service';
import {
  AddressListRespDto,
  AddressRespDto,
} from '../../contract/version1/response/address-response.dto';
import { AddressProcessor } from '../address/address.processor';
import { Address } from '../address/entities/address.entity';
import { UpdateAddressDto } from '../address/dto/update-address.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { ApiInternalServerErrorResponse } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  private readonly logger = new Logger(UserController.name);

  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
    private readonly mobileService: MobileService,
    private readonly addressService: AddressService, // private readonly feedbackService: FeedbackService, // private readonly favouriteService: FavouriteService,
  ) {}

  /**
   * Get user info
   * @param res
   * @returns
   */
  @Get('info')
  async getUser(@Res() res: Response): Promise<any> {
    try {
      this.logger.log('get user info endpoint called');
      const userId = res.locals.userId;
      const crypto = res.locals.cryptoresp;

      if (!userId)
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createError('400 user not found', 'token invalid'));

      const user: User = await this.userService.getUserInfoById(userId);

      if (!user.auth) throw new Error('User does not have an auth');

      const mobile: Mobile = await this.mobileService.getMobileByAuth(
        user.auth,
      );

      const result = UserProcessor.processUserRelationInfo(user, mobile);

      this.logger.debug('successfully retrieved user information');

      if (crypto === 'true') {
        const encryptedResp = await encryptPayload(
          createResponse('successfully retrieved user information', result),
        );
        return res
          .status(HttpStatus.OK)
          .json(createEncryptedResponse(encryptedResp));
      } else {
        return res
          .status(HttpStatus.OK)
          .json(
            createResponse('successfully retrieved user information', result),
          );
      }
    } catch (error) {
      this.logger.error(
        'Error thrown in user.controller.ts, getUser method: ' + error,
      );

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('500 internal server error', 'something went wrong'));
    }
  }

  @Patch('update')
  async updateUser(
    @Body() body: UpdateUserDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.log('update user endpoint called');

      const userId: number = res.locals.id;
      const cryptoresp = res.locals.cryptoresp;

      const respResult: UserRespDto = await this.authService.updateUserInfo(
        body,
        userId,
      );

      const result = createResponse(
        'successfully updated user information',
        respResult,
      );

      if (cryptoresp === 'true') {
        const encryptedResp = await encryptPayload(result);
        return res
          .status(HttpStatus.OK)
          .json(createEncryptedResponse(encryptedResp));
      }

      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      this.logger.error(
        'Error thrown in user.controller.ts, updateUser method: ' + error,
      );

      if (error instanceof ApiInternalServerErrorResponse) {
        throw new HttpException(
          'Error ocurred from user repository with updating user information',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      } else if (error instanceof UnauthorizedException) {
        throw new HttpException(
          'Error ocurred from user repository with updating user information',
          HttpStatus.UNAUTHORIZED,
        );
      }

      throw new HttpException(
        "Something went wrong, we're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('add-address')
  async addUserAddress(@Body() body: AddressDto, @Res() res: Response) {
    try {
      this.logger.debug('add address endpoint called');
      const userId = res.locals.userId;
      body.user = await this.userService.getUserById(userId);
      const addressResp: Address = await this.addressService.addAddress(body);
      const addressRespDto = AddressProcessor.mapEntityToResp(addressResp);
      const result = createResponse(null, addressRespDto);
      return handleCustomResponse(res, result);
    } catch (error) {
      if (error instanceof HttpException) {
        throw new HttpException(error.message, error.getStatus());
      }
      throw new HttpException(
        'address registration failed',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch('update-address')
  async updateUserAddress(@Body() body: UpdateAddressDto) {
    try {
      const resp: Address = await this.addressService.updateAddress(body);
      const userAddress: AddressRespDto =
        AddressProcessor.mapEntityToResp(resp);
      return createResponse(null, userAddress);
    } catch (error) {
      this.logger.error(
        'Error thrown in updateUserAddress method in user.controller.ts, with error: ',
        error,
      );

      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('QuiikMart Server Error');
    }
  }

  @Get('get-address')
  async getUserAddress(@Res() res: Response) {
    try {
      const userId = res.locals.userId;

      if (!userId) throw new BadRequestException('Token required in header!');

      const userAddressList = await this.addressService.getAddress(userId);
      const clearResponse = createResponse(null, userAddressList);

      return handleCustomResponse(res, clearResponse);
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('QuiikMart Server Error');
    }
  }

  @Delete('delete-address')
  async deleteUserAddress(@Body() body: any, @Res() res: Response) {
    try {
      // TODO: make this body standard
      const userId = res.locals.userId;
      const addressId = body.addressId;

      if (!userId) throw new BadRequestException('Token required in header!');
      if (!addressId)
        throw new BadRequestException('Address id required in body!');

      await this.addressService.deleteUserAddress(addressId, userId);

      // return createResponse(null, 'Address successfully deleted');
      return handleCustomResponse(
        res,
        createResponse('successfully deleted address', null),
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException('QuiikMart Server Error');
    }
  }
}
