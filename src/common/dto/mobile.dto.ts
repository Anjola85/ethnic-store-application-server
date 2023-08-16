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
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '+1' })
  @IsString()
  isoCode: string;

  @ApiProperty({ example: 'CA' })
  @IsString()
  isoType: string;
}
