import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class EntityMobileDto {
  @ApiProperty({ example: '+6473334839' })
  phone_number: string;

  @ApiProperty({ example: '+1' })
  country_code: string;

  @ApiProperty({ example: 'CA' })
  iso_code: string;
}

/**
 * Defining the structire for the mobile field
 */
export class MobileDto {
  @ApiProperty({ example: '+6473334839' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '+1' })
  @IsString()
  countryCode: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  isoCode: string;
}

export class MobileGroupDto {
  @ApiProperty({
    example: {
      phoneNumber: '+6473334839',
      countryCode: '+1',
      isoCode: 'CA',
    },
  })
  @IsObject()
  @IsNotEmpty()
  primary: {
    phoneNumber: string;
    countryCode: string;
    isoCode: string;
  };

  @ApiProperty({
    example: {
      phone_number: '+6473334839',
      country_code: '+1',
      isoCode: 'CA',
    },
  })
  @IsObject()
  @IsOptional()
  secondary: {
    phoneNumber: string;
    countryCode: string;
    isoCode: string;
  };
}
