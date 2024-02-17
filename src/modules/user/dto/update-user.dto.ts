import { PartialType } from '@nestjs/mapped-types';
import { UserDto } from './user.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEmail,
  ValidateNested,
  IsString,
  IsNumber,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { AddressDto } from 'src/modules/address/dto/address.dto';
import { UpdateAuthDto } from 'src/modules/auth/dto/update-auth.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  lastName: string;

  @IsOptional()
  @IsEmail()
  @ApiProperty({
    description: 'The email address of the person',
    example: 'johndoe@quickie.com',
  })
  email: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => MobileDto)
  @ApiProperty({
    description: 'The mobile phone number of the person',
    example: { phone_number: '1234567890', country_code: '+1', iso_type: 'CA' },
  })
  mobile: MobileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  @ApiProperty({
    description: 'The address of the person',
    example: {
      primary: true,
      unit: '123',
      street: '123 Main St',
      city: 'Toronto',
      province: 'Ontario',
      postalCode: 'Q1Z 3KL',
      country: 'Canada',
      location: '43.6532, 79.3832',
    },
  })
  address: AddressDto;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  profileImage: Express.Multer.File;

  @IsOptional()
  @IsString()
  profileImageUrl: string;

  @IsOptional()
  auth: UpdateAuthDto;
}
