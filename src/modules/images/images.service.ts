import { Injectable, MaxFileSizeValidator } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Image, ImageDocument } from './entities/image.entity';
import * as AWS from 'aws-sdk';

export interface ImageData {
  buiness_id: string;
  background_blob: Express.Multer.File;
  feature_image_blob: Express.Multer.File;
  logo_blob: Express.Multer.File;
}

@Injectable()
export class ImagesService {
  s3 = new AWS.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_KEY_SECRET,
  });

  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<ImageDocument>,
  ) {}

  /**
   * This method takes in a business image data object and uploads the images to the AWS S3 bucket
   * @param data - the image data object
   * @returns
   */
  async uploadImageToS3(data: ImageData) {
    const { buiness_id, background_blob, feature_image_blob, logo_blob } = data;

    try {
      const [backgroundUrl, featureImageUrl, logoUrl] = await Promise.all([
        this.uploadImageToFolder(buiness_id, 'background', background_blob),
        this.uploadImageToFolder(
          buiness_id,
          'feature_image',
          feature_image_blob,
        ),
        this.uploadImageToFolder(buiness_id, 'logo', logo_blob),
      ]);

      return {
        backgroundUrl,
        featureImageUrl,
        logoUrl,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Takes in params below and uploads to the specified folder in the AWS S3 bucket
   * @param businessId - the business id
   * @param folderName - the folder name to upload to
   * @param imageBlob  - the image blob
   * @returns
   */
  async uploadImageToFolder(
    businessId: string,
    folderName: string,
    imageBlob: Express.Multer.File,
  ): Promise<any> {
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME || 'home-closer-assets-db',
      Key: `business_assets/${businessId}/${folderName}/${imageBlob.originalname}`,
      Body: imageBlob.buffer,
    };

    const s3Response = await this.s3.upload(params).promise();
    return s3Response.Location;
  }

  validateImageFile(file: Express.Multer.File): never | void {
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    const maxFileSize = 250000; // Set your maximum file size in bytes

    // check if file is of right type
    if (!allowedFileTypes.includes(file.mimetype))
      throw new Error(`Invalid file type for ${file.originalname}`);

    // check if file is of right size
    const maxFileSizeValidator = new MaxFileSizeValidator({
      maxSize: maxFileSize,
    });

    if (!maxFileSizeValidator.isValid(file))
      throw new Error(`${file.originalname} too large`);
  }
}
