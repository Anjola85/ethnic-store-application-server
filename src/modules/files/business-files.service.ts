import { Injectable } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';
import {
  S3BusinessImagesRequest,
  S3BusinessImagesResponse,
} from '../business/dto/image.dto';

@Injectable()
export class BusinessFilesService {
  private readonly rootFolder = 'business_assets';
  private readonly imageFolders: { [key: string]: string } = {
    background_image_blob: 'background_image',
    featured_image_blob: 'feature_image',
    profile_image_blob: 'logo_image',
  };

  constructor(private awsS3Service: AwsS3Service) {}

  /**
   * Uploads background, logo, featured images to the AWS S3 bucket
   * @param data
   * @returns
   */
  async uploadBusinessImagesToS3(
    data: S3BusinessImagesRequest,
  ): Promise<S3BusinessImagesResponse> {
    const { business_id } = data;

    const uploadPromises: Promise<string | null>[] = []; // Use null as the default value

    for (const [prop, folder] of Object.entries(this.imageFolders)) {
      const imageBlob: Express.Multer.File | string =
        data[prop as keyof S3BusinessImagesRequest];

      if (imageBlob && typeof imageBlob !== 'string') {
        const folderPath = `${this.rootFolder}/${business_id}/${folder}/${imageBlob.originalname}`;
        uploadPromises.push(
          this.awsS3Service.uploadImgToFolder(folderPath, imageBlob.buffer),
        );
      }
    }

    const uploadedImages = await Promise.all(uploadPromises);

    const result = Object.fromEntries(
      Object.keys(this.imageFolders).map((propName, index) => [
        propName,
        uploadedImages[index] || null, // Use null as the default value
      ]),
    );

    const imagesUrl: S3BusinessImagesResponse = {
      backgroundImage: result.background_image_blob || '',
      profileImage: result.profile_image_blob || '',
      // featuredImage: result.featured_image_blob || '',
    };

    return imagesUrl;
  }
}
