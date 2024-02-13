import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator';
import { BaseDto } from './base.dto';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Business } from 'src/modules/business/entities/business.entity';

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

  @ApiProperty({ example: false })
  @IsOptional()
  isPrimary?: boolean;

  @ApiProperty({ example: 'auth' })
  @IsOptional()
  auth: Auth;

  @ApiProperty({ example: 'business' })
  @IsOptional()
  business: Business;
}
