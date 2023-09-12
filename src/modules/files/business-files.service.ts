import { Injectable } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';

export interface BusinessImages {
  buiness_id: string;
  background_blob?: Express.Multer.File;
  feature_image_blob?: Express.Multer.File;
  logo_blob?: Express.Multer.File;
}

@Injectable()
export class BusinessFilesService {
  private readonly rootFolder = 'business_assets';
  private readonly imageFolders: { [key: string]: string } = {
    background_blob: 'background_image',
    feature_image_blob: 'feature_image',
    logo_blob: 'logo_image',
  };

  constructor(private awsS3Service: AwsS3Service) {}

  /**
   * Uploads background, logo, featured images to the AWS S3 bucket
   * @param data
   * @returns
   */
  async uploadBusinessImages(
    data: BusinessImages,
  ): Promise<{ [k: string]: string }> {
    const { buiness_id } = data;

    const uploadPromises: Promise<string | null>[] = []; // Use null as the default value

    for (const [prop, folder] of Object.entries(this.imageFolders)) {
      const imageBlob: Express.Multer.File | string =
        data[prop as keyof BusinessImages];

      if (imageBlob && typeof imageBlob !== 'string') {
        const folderPath = `${this.rootFolder}/${buiness_id}/${folder}/${imageBlob.originalname}`;
        uploadPromises.push(
          this.awsS3Service.uploadImgToFolder(folderPath, imageBlob.buffer),
        );
      }
    }

    const uploadedImages = await Promise.all(uploadPromises);

    return Object.fromEntries(
      Object.keys(this.imageFolders).map((propName, index) => [
        propName,
        uploadedImages[index] || null, // Use null as the default value
      ]),
    );
  }
}
