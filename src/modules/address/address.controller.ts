import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete, HttpException, HttpStatus, Logger, NotFoundException, BadRequestException, InternalServerErrorException
} from "@nestjs/common";
import { AddressService } from './address.service';
import { AddressDto } from './dto/address.dto';
import { Response } from 'express';
import { UpdateAddressDto } from './dto/update-address.dto';
import { createResponse, extractIdFromRequest, handleCustomResponse, TokenIdType } from "../../common/util/response";
import { encryptPayload } from "../../common/util/crypto";
import { EncryptedDTO } from "../../common/dto/encrypted.dto";
import { UpdateFavouriteDto } from "../favourite/dto/update-favourite.dto";
import { AddressRespDto } from "../../contract/version1/response/address-response.dto";
import { UserService } from "../user/user.service";
import { User } from "../user/entities/user.entity";

@Controller('address')
export class AddressController {
  private readonly logger = new Logger(AddressController.name);
  constructor(private readonly addressService: AddressService, private readonly  userService: UserService) {}


  @Patch('update-unit')
  async updateUnit(@Body() addressDtoRequest: UpdateAddressDto, @Res() res: Response) {
    try {
      const userId = extractIdFromRequest(res, TokenIdType.userId);
      const user: User = await this.userService.getUserById(userId);
      const addressRespDto: AddressRespDto = await this.addressService.updateUnit(addressDtoRequest, user);
      return handleCustomResponse(res, createResponse(null, addressRespDto));
    } catch(error) {
      this.logger.error("Error occured in updateUnit in address.controller.ts with error: " + error);

      if(error instanceof  HttpException)
        throw error

      throw new HttpException(
        'Something went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );    }
  }

  @Post('remove')
  async removeFromAddress(@Body() addressId: number) {
    try {
      this.logger.log('remove from address endpoint called');

      if (!addressId) {
        throw new HttpException(
          'Address not provided',
          HttpStatus.BAD_REQUEST,
        );
      }

      await this.addressService.deleteAddress(
        addressId
      );

      return createResponse('Address successfully removed');
    } catch (error) {
      this.logger.error(
        'Error thrown in address.controller.ts, removeFromAddress method: ' +
        error +
        ' with error message: ' +
        error.message,
      );

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        'Somthing went wrong',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
