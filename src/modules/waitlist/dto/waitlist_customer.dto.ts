import { IsEmail, IsJSON, IsNotEmpty, IsString, Length } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class WaitlistCustomerDto {
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
}
