import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from 'src/common/dto/address.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';

/**
 * Contains all the string fields in person.entity.class
 */
export class PersonDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The first name of the person' })
  firstName: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The last name of the person' })
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ description: 'The email address of the person' })
  email: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({
    description: 'The address of the person',
    example: {
      unit: '123',
      street: 'Main St',
      city: 'Toronto',
      province: 'ON',
      country: 'CA',
    },
  })
  address: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phoneNumber: '1234567890', isoCode: 'CA' },
  })
  mobile: MobileDto;
}
