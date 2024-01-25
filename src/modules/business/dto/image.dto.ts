import { IsOptional, IsString } from 'class-validator';

export class S3BusinessImagesResponse {
  @IsOptional()
  @IsString()
  featuredImage?: string;

  @IsOptional()
  @IsString()
  backgroundImage?: string;

  @IsOptional()
  @IsString()
  profileImage?: string;
}

export class ImagesRequestDto {
  @IsOptional()
  featuredImage?: Express.Multer.File;

  @IsOptional()
  backgroundImage?: Express.Multer.File;

  @IsOptional()
  profileImage?: Express.Multer.File;
}

export interface S3BusinessImagesRequest {
  business_id: string;
  background_image_blob?: Express.Multer.File;
  featured_image_blob?: Express.Multer.File;
  profile_image_blob?: Express.Multer.File;
}
