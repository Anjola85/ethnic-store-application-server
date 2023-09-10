import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddressDto } from 'src/common/dto/address.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { UserProfile } from '../user.enums';

/**
 * Generic DTO
 * This class has all the possible fields required to register a user
 */
export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The first name of the person', example: 'John' })
  first_name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ description: 'The last name of the person', example: 'Doe' })
  last_name: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'The address of the person',
    example: {
      unit: '123',
      street: 'Street 1',
      city: 'City 1',
      province: 'Province 1',
      postalCode: '12345',
      country: 'Country 1',
    },
  })
  address: AddressDto;

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

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The type of user being resgistered',
    example: 'customer',
  })
  user_profile: UserProfile;

  @IsOptional()
  dob: string;

  @IsOptional()
  profile_picture: string;
}
