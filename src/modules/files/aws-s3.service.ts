// shared/aws-s3.service.ts
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class AwsS3Service {
  private readonly AWS_S3: AWS.S3;
  private readonly BUCKET_NAME =
    process.env.AWS_BUCKET_NAME || 'home-closer-assets-db';

  constructor() {
    this.AWS_S3 = new AWS.S3({
      accessKeyId: process.env.AWS_S3_ACCESS_KEY,
      secretAccessKey: process.env.AWS_S3_KEY_SECRET,
    });
  }

  /**
   * Uploads an image to the AWS S3 bucket
   * @param folderPath - the folder path in the S3 bucket
   * @param fileName  - the file name
   * @param imageBlob - the image blob
   * @returns the image url
   */
  async uploadImgToFolder(
    folderPath: string,
    imageBuffer: Buffer,
  ): Promise<string> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: folderPath,
      Body: imageBuffer,
    };

    const s3Response = await this.AWS_S3.upload(params).promise();
    return s3Response.Location;
  }

  /**
   * Gets the image url from the AWS S3 bucket
   * @param folderPath
   * @returns
   */
  async getImageUrl(folderPath: string): Promise<string> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: folderPath,
    };

    const s3Response = await this.AWS_S3.getSignedUrlPromise(
      'getObject',
      params,
    );
    return s3Response;
  }

  /**
   * Downloads an image from the AWS S3 bucket
   * @param folderPath
   * @returns buffer of image
   */
  async downloadImageFromFolder(folderPath: string): Promise<Buffer> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Key: folderPath,
    };

    const s3Response = await this.AWS_S3.getObject(params).promise();
    return s3Response.Body as Buffer;
  }

  /**
   * Return the number of files in a folder
   * @param folderPath
   * @returns
   */
  async countFilesInFolder(folderPath: string): Promise<number> {
    const params = {
      Bucket: this.BUCKET_NAME,
      Prefix: folderPath,
    };
    const s3Response = await this.AWS_S3.listObjectsV2(params).promise();
    return s3Response.KeyCount;
  }
}
