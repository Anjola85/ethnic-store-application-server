import { Injectable } from '@nestjs/common';
import {
  GetObjectCommand,
  GetObjectCommandOutput,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class AwsS3Service {
  private readonly s3Client: S3Client;
  private readonly BUCKET_NAME =
    process.env.AWS_BUCKET_NAME || 'quiikmart-version1-app';

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_S3_REGION || 'ca-centra-1',
      credentials: {
        accessKeyId: process.env.AWS_S3_ACCESS_KEY,
        secretAccessKey: process.env.AWS_S3_KEY_SECRET,
      },
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

    const command = new PutObjectCommand(params);
    const s3Response = await this.s3Client.send(command);
    // return s3Response.Location;
    return `https://${this.BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${folderPath}`;
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

    const command = new GetObjectCommand(params);
    const s3Response = await getSignedUrl(this.s3Client, command, {
      expiresIn: 3600,
    });
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

    const command = new GetObjectCommand(params);
    const s3Response: GetObjectCommandOutput = await this.s3Client.send(
      command,
    );
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      const stream = s3Response.Body as Readable;
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
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
    const command = new ListObjectsV2Command(params);
    const s3Response = await this.s3Client.send(command);
    return s3Response.KeyCount;
  }
}
