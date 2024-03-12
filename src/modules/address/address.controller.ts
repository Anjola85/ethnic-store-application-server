import {
  Controller,
  Get,
  Res,
  Post,
  Body,
  Patch,
  Param,
  Delete, HttpException, HttpStatus, Logger
} from "@nestjs/common";
import { AddressService } from './address.service';
import { AddressDto } from './dto/address.dto';
import { Response } from 'express';
import { UpdateAddressDto } from './dto/update-address.dto';
import { createResponse, handleCustomResponse } from "../../common/util/response";
import { encryptPayload } from "../../common/util/crypto";
import { EncryptedDTO } from "../../common/dto/encrypted.dto";
import { UpdateFavouriteDto } from "../favourite/dto/update-favourite.dto";
import { AddressRespDto } from "../../contract/version1/response/address-response.dto";

@Controller('address')
export class AddressController {
  private readonly logger = new Logger(AddressController.name);
  constructor(private readonly addressService: AddressService) {}


  @Post('update-unit')
  async updateUnit(@Body() addressDtoRequest: AddressDto, @Res() res: Response) {
    try {
      const userId = res.locals.userId;
      const addressRespDto: AddressRespDto = await this.addressService.updateUnit(addressDtoRequest, userId);
      return handleCustomResponse(res, createResponse(null, addressRespDto));
    } catch(error) {

    }
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
