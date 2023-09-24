import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressDto } from './dto/address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('address')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

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
