import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import { AddressDto } from 'src/common/dto/address.dto';
import { ImagesDto } from 'src/modules/business/dto/image.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { ScheduleDto } from 'src/modules/business/dto/schedule.dto';
import { GeoLocationDto } from './geolocation.dto';
import { IdNameDto } from 'src/common/dto/IdNameDto.dto';

export class CreateBusinessDto {
  @ApiProperty({
    description: 'The merchantID this business belongs to',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly merchantId?: string;

  @ApiProperty({
    example: {
      id: '',
      name: '',
    },
  })
  @IsNotEmpty()
  @IsObject()
  @Type(() => IdNameDto)
  readonly category: IdNameDto;

  @ApiProperty({
    example: {
      id: '',
      name: '',
    },
  })
  @IsNotEmpty()
  @IsObject()
  @Type(() => IdNameDto)
  continent: IdNameDto;

  @IsNotEmpty()
  @IsObject()
  @Type(() => IdNameDto)
  country: IdNameDto;

  @IsNotEmpty()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IdNameDto)
  countries: IdNameDto[];

  @ApiProperty({
    description: 'The reviewsID the business belongs to',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly reviewId?: string;

  @ApiProperty({
    description: 'Business name',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Address of the business',
    required: true,
    type: () => AddressDto,
  })
  @Type(() => AddressDto)
  readonly address: AddressDto;

  @ApiProperty({
    description: 'Email of the business',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  readonly email: string;

  @ValidateNested()
  @ApiProperty({
    description: 'Mobile phone number of the business',
    required: true,
  })
  @Type(() => MobileDto)
  readonly mobile: MobileDto;

  @ApiProperty({
    description: 'Description of the business',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly description: string;

  @ApiProperty({
    description: 'Business schedule',
    required: false,
    type: () => ScheduleDto,
  })
  @Type(() => ScheduleDto)
  readonly schedule?: ScheduleDto;

  @ApiProperty({
    description: 'Website of the business',
    required: false,
  })
  @IsString()
  readonly website?: string;

  @ApiProperty({
    description: 'Rating of the business',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly rating: string;

  @ApiProperty({
    description: 'Images of the business',
    required: false,
    type: ImagesDto,
  })
  @Type(() => ImagesDto)
  readonly images?: ImagesDto;

  @ApiProperty({
    description: 'Navigation URL of the business',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  readonly navigationUrl: string;

  @ApiProperty({
    description: 'google place id of the business',
    required: false,
  })
  @IsNotEmpty()
  @IsString()
  readonly googlePlaceId: string;

  // geolocation
  @ApiProperty({
    description: 'google place id of the business',
    required: false,
    type: () => GeoLocationDto,
  })
  @Type(() => GeoLocationDto)
  @IsNotEmpty()
  readonly geolocation: GeoLocationDto;
}
