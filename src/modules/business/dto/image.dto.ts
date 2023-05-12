import { IsOptional, IsString } from 'class-validator';

export class ImagesDto {
  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  background?: string;
}
