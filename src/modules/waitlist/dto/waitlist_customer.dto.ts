import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class WaitlistCustomerDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @Type(() => MobileDto)
  mobile: MobileDto;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  zipCode: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsNotEmpty()
  promotions: boolean;

  @IsOptional()
  @IsString()
  waitlist_uuid: string;
}
