import { IsString } from 'class-validator';
import { loginDto } from './login.dto';

export class secureLoginDto extends loginDto {
  @IsString()
  code: string;
}
