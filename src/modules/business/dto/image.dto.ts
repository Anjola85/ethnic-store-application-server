import { IsOptional, IsString } from 'class-validator';

export class ImagesDto {
  @IsOptional()
  @IsString()
  featured?: string;

  @IsOptional()
  @IsString()
  background?: string;

  @IsOptional()
  @IsString()
  logo?: string;
}

export class UploadedImagesDto {
  @IsOptional()
  featured?: Express.Multer.File;

  @IsOptional()
  background?: Express.Multer.File;

  @IsOptional()
  logo?: Express.Multer.File;
}
