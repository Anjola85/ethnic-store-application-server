import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { BaseDto } from './base.dto';

/**
 * Defining the structure for the mobile field
 */
export class MobileDto extends BaseDto {
  @ApiProperty({ example: '6473334839' })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '+1' })
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @ApiProperty({ example: 'CA' })
  @IsNotEmpty()
  @IsString()
  isoType: string;
}
