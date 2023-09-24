import { PartialType } from '@nestjs/mapped-types';
import { AddressDto } from './address.dto';

export class UpdateAddressDto extends PartialType(AddressDto) {}
