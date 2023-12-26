import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  isString,
} from 'class-validator';

export class EncryptedDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'The encrypted payload',
    example: 'QICAHjLuDRTnKVsgRzvUy74xztM2frynZUHkg/Nv5ZSxXo+PgEQ38Qyw6ImBt',
  })
  payload: string;
}
