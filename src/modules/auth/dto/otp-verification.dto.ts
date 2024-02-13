import { IsNotEmpty, IsNumber, IsString, isString } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class VerifyOtpDto {
  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  authId: number;
}
