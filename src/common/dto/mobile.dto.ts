import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
} from 'class-validator';

/**
 * Defining the structire for the mobile field
 */
export class MobileDto {
  @ApiProperty({ example: '+14165555555' })
  @IsOptional()
  @IsPhoneNumber('CA')
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '+1' })
  @IsOptional()
  @IsString()
  isoCode: string;

  @ApiProperty({ example: 'CA' })
  @IsOptional()
  @IsString()
  isoType: string;
}
