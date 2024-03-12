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
import { createResponse } from "../../common/util/response";
import { encryptPayload } from "../../common/util/crypto";
import { EncryptedDTO } from "../../common/dto/encrypted.dto";

@Controller('address')
export class AddressController {
  private readonly logger = new Logger(AddressController.name);
  constructor(private readonly addressService: AddressService) {}

  /**
   * This endpoint returns the registered address
   * @param body
   * @param res
   */
  // @Post('add-address')
  // async addAddress(@Body() body: AddressDto, @Res() res: Response) {
  //   try {
  //     this.logger.debug("add address endpoint called");
  //     const userId = res.locals.userId;
  //     const cryptoresp = res.locals.cryptoresp
  //     const resp = this.addressService.addUserAddress(body, userId);
  //     const clearResp = createResponse('address registration successful', resp);
  //
  //     if(cryptoresp === 'false')
  //       return res.status(HttpStatus.CREATED).json(clearResp);
  //
  //     const encryptedData = await encryptPayload(clearResp);
  //
  //     const encryptedResp: EncryptedDTO = {
  //       payload: encryptedData
  //     };
  //
  //     return res.status(HttpStatus.OK).json(encryptedResp);
  //   } catch (error) {
  //     if (error instanceof HttpException) {
  //       throw new HttpException(error.message, error.getStatus());
  //     }
  //
  //     throw new HttpException(
  //       'address registration failed', HttpStatus.INTERNAL_SERVER_ERROR
  //     );
  //   }
  // }


  // @Post()
  // create(@Body() createAddressDto: AddressDto) {
  //   return this.addressService.create(createAddressDto);
  // }

  // @Get()
  // findAll() {
  //   return this.addressService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.addressService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAddressDto: UpdateAddressDto) {
  //   return this.addressService.update(+id, updateAddressDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.addressService.remove(+id);
  // }
}
