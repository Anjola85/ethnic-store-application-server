import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { MobileDto, MobileGroupDto } from 'src/common/dto/mobile.dto';
import { ScheduleDto } from 'src/modules/business/dto/schedule.dto';
import { GeoLocationDto } from './geolocation.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { AddressDto } from 'src/modules/address/dto/address.dto';
import { S3BusinessImagesResponse } from './image.dto';

export class BusinessDto {
  @IsOptional()
  @ApiProperty()
  @IsObject()
  owner?: User;

  @ApiProperty()
  @IsObject()
  primaryCountry: Country;

  @ApiProperty()
  @IsArray()
  otherCountries: Country[];

  @ApiProperty()
  @IsArray()
  categories: Category[];

  @ApiProperty()
  @IsString()
  name: string; // name has to be unique

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => MobileGroupDto)
  mobile: MobileDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty()
  @IsString()
  website: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  rating: string;

  @ApiProperty({ type: 'string', format: 'string' })
  featuredImage: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  backgroundImage: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  logoImage: string;

  @IsOptional()
  @ApiProperty({ description: 'test-description', example: 'test-value' })
  images: S3BusinessImagesResponse;

  @ApiProperty({ description: 'test-description', example: 'test-value' })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  geolocation: GeoLocationDto;

  @ApiProperty({ description: 'test-description', example: 'test-value' })
  @IsString()
  businessType: string;
}
