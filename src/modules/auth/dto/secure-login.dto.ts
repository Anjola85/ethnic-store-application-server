import { IsString } from 'class-validator';
import { loginDto } from './login.dto';

export class SecureLoginDto extends loginDto {
  @IsString()
  code: string;
}
