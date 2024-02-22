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

export class AddressDto extends BaseDto {
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  primary: boolean;

  @ApiProperty({ example: '123' })
  @IsOptional()
  @IsString()
  @LimitWordCount(5)
  unit: string;

  @ApiProperty({ example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(20)
  street: string;

  @ApiProperty({ example: 'Toronto' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(5)
  city: string;

  @ApiProperty({ example: 'Ontario' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(10)
  province: string;

  @ApiProperty({ example: 'Q1Z 3KL' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(4)
  postalCode: string;

  @ApiProperty({ example: 'Canada' })
  @IsNotEmpty()
  @IsString()
  @LimitWordCount(4)
  country: string;

  @IsOptional()
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  user: User = null;

  @IsOptional()
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  business: Business = null;

  // @IsOptional()
  // @IsLatitude()
  // @IsLongitude()
  // @ApiProperty({ description: 'test-description', example: 'test-value' })
  // location: string;

  @IsOptional()
  location: GeoJSONPoint;
}
