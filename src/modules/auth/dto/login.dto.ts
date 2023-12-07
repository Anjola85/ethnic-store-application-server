import { IsOptional } from 'class-validator';
import { MobileDto } from 'src/common/dto/mobile.dto';

export class loginDto {
  @IsOptional()
  email?: string;

  @IsOptional()
  mobile?: MobileDto;
}
