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
  @IsString()
  @ApiProperty({ description: 'The id of the user' })
  _id: string;

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
  @ApiProperty({
    description: 'The address of the person',
    example: {
      primary: {
        street: 'Street 1',
        city: 'City 1',
        province: 'Province 1',
        postalCode: '12345',
        country: 'Country 1',
      },
      other: {
        key1: {
          street: 'Street 1',
          city: 'City 1',
          province: 'Province 1',
          postalCode: '12345',
          country: 'Country 1',
        },
        key2: {
          street: 'Street 2',
          city: 'City 2',
          province: 'Province 2',
          postalCode: '67890',
          country: 'Country 2',
        },
      },
    },
  })
  address: {
    primary: AddressDto;
    other?: {
      [key: string]: AddressDto;
    };
  };

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phoneNumber: '1234567890', isoCode: '+1', isoType: 'CA' },
  })
  mobile: MobileDto;
}
