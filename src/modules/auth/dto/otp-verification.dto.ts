import { IsNotEmpty, IsString, isString } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class otpVerifyDto {
  @IsString()
  code: string;

  @IsString()
  entryTime: string;
}
