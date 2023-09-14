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
import { AddressDto } from 'src/common/dto/address.dto';
import {
  ImagesDto,
  UploadedImagesDto,
} from 'src/modules/business/dto/image.dto';
import { MobileGroupDto } from 'src/common/dto/mobile.dto';
import { ScheduleDto } from 'src/modules/business/dto/schedule.dto';
import { GeoLocationDto } from './geolocation.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { Country } from 'src/modules/country/entities/country.entity';
import { Category } from 'src/modules/category/entities/category.entity';

export class CreateBusinessDto {
  @IsOptional() // remove this
  @ApiProperty()
  @IsString()
  user: User;

  @ApiProperty()
  @IsString()
  country: Country;

  @ApiProperty() s;
  @IsArray()
  otherCountries: Country[] = [];

  @ApiProperty()
  @IsString()
  name: string;

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
  mobile: MobileGroupDto;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => ScheduleDto)
  schedule: ScheduleDto;

  @ApiProperty()
  @IsString()
  website: string;

  @ApiProperty()
  @IsString()
  rating: string;

  @ApiProperty()
  featuredImage: Express.Multer.File;

  @ApiProperty()
  backgroundImage: Express.Multer.File;

  @ApiProperty()
  logoImage: Express.Multer.File;

  @ApiProperty()
  @IsString()
  navigationUrl: string;

  @ApiProperty()
  @IsObject()
  @ValidateNested()
  @Type(() => GeoLocationDto)
  geolocation: GeoLocationDto;

  @ApiProperty()
  @IsArray()
  categories: Category[];

  @ApiProperty()
  @IsString()
  businessType: string;
}
