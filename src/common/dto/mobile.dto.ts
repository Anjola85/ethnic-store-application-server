import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';

export class EntityMobileDto {
  @ApiProperty({ example: '+6473334839' })
  phone_number: string;

  @ApiProperty({ example: '+1' })
  country_code: string;

  @ApiProperty({ example: 'CA' })
  iso_type: string;
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
  isoType: string;
}

export class MobileGroupDto {
  @ApiProperty({
    example: {
      phoneNumber: '+6473334839',
      countryCode: '+1',
      isoType: 'CA',
    },
  })
  @IsObject()
  @IsNotEmpty()
  primary: MobileDto;

  @ApiProperty({
    example: {
      phone_number: '+6473334839',
      country_code: '+1',
      isoType: 'CA',
    },
  })
  @IsObject()
  @IsOptional()
  secondary: MobileDto;
}
