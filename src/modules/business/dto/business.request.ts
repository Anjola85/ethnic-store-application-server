import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
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

export class BusinessRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsObject()
  primaryCountry: Country;

  @ApiProperty()
  @IsArray()
  @IsNotEmpty()
  otherCountries: Country[];

  // @ApiProperty()
  // @IsArray()
  // categories: Category[];

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  @IsNotEmpty()
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

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  featuredImage: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  backgroundImage: Express.Multer.File;

  @ApiProperty({ type: 'string', format: 'binary' })
  @IsOptional()
  profileImage: Express.Multer.File;

  @ApiProperty({ description: 'test-description', example: 'test-value' })
  @IsString()
  businessType: string;
}
