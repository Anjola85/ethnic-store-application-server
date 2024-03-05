import { IsEmail, IsJSON, IsNotEmpty, IsString, Length } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class WaitlistShopperDto {
  @IsNotEmpty()
  @IsString()
  firstname: string;

  @IsNotEmpty()
  @IsString()
  lastname: string;

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
  @IsString()
  age: string;

  @IsNotEmpty()
  @IsString()
  country: string;

  @IsString()
  waitlist_uuid: string;
}
