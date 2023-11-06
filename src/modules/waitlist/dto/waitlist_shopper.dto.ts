import {
  IsEmail,
  IsJSON,
  IsNotEmpty,
  IsNumber,
  IsString,
  Length,
} from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class WaitlistShopperDto {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsJSON()
  mobile: MobileDto;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  @Length(6)
  zipCode: string;

  @IsNotEmpty()
  @IsNumber()
  age: number;

  @IsNotEmpty()
  @IsString()
  vehicleType: string;
}
