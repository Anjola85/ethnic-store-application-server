import { IsNotEmpty, IsString, isString } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class loginDto {
  @IsString()
  email?: string;

  mobile?: MobileDto;

  @IsString()
  password: string;
}
