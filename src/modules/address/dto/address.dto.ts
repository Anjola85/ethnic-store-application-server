import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNotEmpty,
  IsLongitude,
  IsLatitude,
  IsBoolean,
} from 'class-validator';
import { BaseDto } from 'src/common/dto/base.dto';
import { LimitWordCount } from 'src/common/validation/decorator/limit-word-count.decorator';
import { Business } from 'src/modules/business/entities/business.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { GeoJSONPoint } from './geo-json-point.dto';
import { IsAlphaNumeric } from 'src/common/validation/decorator/aphanumeric.decorator';

export class AddressDto extends BaseDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  primary: boolean;

  @ApiProperty({ example: '123' })
  @IsOptional()
  @IsString()
  @IsAlphaNumeric()
  unit: string;

  @ApiProperty({ example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  street: string;

  @ApiProperty({ example: 'Toronto' })
  @IsNotEmpty()
  @IsString()
  @IsAlphaNumeric()
  city: string;

  @ApiProperty({ example: 'Ontario' })
  @IsNotEmpty()
  @IsString()
  @IsAlphaNumeric()
  province: string;

  @ApiProperty({ example: 'Q1Z 3KL' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(6)
  @IsAlphaNumeric()
  postalCode: string;

  @ApiProperty({ example: 'Canada' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @IsOptional()
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  user: User = null;

  @IsOptional()
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  business: Business = null;

  @IsOptional()
  location: GeoJSONPoint;
}
