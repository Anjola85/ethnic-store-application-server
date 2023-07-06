import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isString,
} from 'class-validator';

export class EncryptedDTO {
  @IsString()
  payload: string;
}
