import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsJSON, IsNotEmpty, IsString, Length } from 'class-validator';
import { PhoneNumberDto } from 'src/common/dto/mobile.dto';
import { AddressDto } from 'src/modules/address/dto/address.dto';

export class WaitlistBusinessDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsJSON()
  mobile: PhoneNumberDto;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The address of the person',
    example: {
      unit: '123',
      street: 'Street 1',
      city: 'City 1',
      province: 'Province 1',
      postalCode: '12345',
      country: 'Country 1',
    },
  })
  address: AddressDto;

  @IsNotEmpty()
  @IsString()
  type: string;
}
