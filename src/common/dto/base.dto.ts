import { IsOptional } from 'class-validator';

export class BaseDto {
  @IsOptional()
  id;
}
