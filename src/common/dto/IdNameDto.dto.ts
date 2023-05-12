import { IsNotEmpty, IsString } from 'class-validator';

export class IdNameDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;
}
