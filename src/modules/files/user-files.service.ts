import { Injectable } from '@nestjs/common';
import { AwsS3Service } from './aws-s3.service';

@Injectable()
export class UserFileService {
  private readonly host_url = 'https://home-closer-assets-db.s3.amazonaws.com';
  private readonly rootFolder = 'user_assets';
  private readonly avatarFolder = 'avatar_images';
  private readonly profileFolder = 'profile_image';
  private readonly documentFolder = 'documents';

  constructor(private awsS3Service: AwsS3Service) {}

  /**
   *
   * @param imageBlob
   * @returns
   */
  async uploadAvatarImage(imageBlob: Express.Multer.File) {
    const imageCount =
      (await this.awsS3Service.countFilesInFolder(
        `${this.rootFolder}/${this.avatarFolder}`,
      )) + 1;

    const folderPath = `${this.rootFolder}/${this.avatarFolder}/avatar_${imageCount}`;
    const avatarUrl = await this.awsS3Service.uploadImgToFolder(
      folderPath,
      imageBlob.buffer,
    );
    return avatarUrl;
  }

  /**
   * @returns - a random avatar url
   */
  async getRandomAvatar(): Promise<string> {
    const imageCount = await this.awsS3Service.countFilesInFolder(
      `${this.rootFolder}/${this.avatarFolder}`,
    );

    const randomAvatarNumber = Math.floor(Math.random() * imageCount) + 1;

    const avatarUrl = `${this.host_url}/${this.rootFolder}/${this.avatarFolder}/avatar_${randomAvatarNumber}`;
    return avatarUrl;
  }

  // endpoint to upload profile picture
  async uploadProfileImage(
    userId: string,
    imageBlob: Express.Multer.File,
  ): Promise<string> {
    const folderPath = `${this.rootFolder}/${userId}/${this.profileFolder}`;
    const profilePictureUrl = await this.awsS3Service.uploadImgToFolder(
      folderPath,
      imageBlob.buffer,
    );
    return profilePictureUrl;
  }

  /**
   *
   * @param userId
   * @param imageBlob
   * @param docName
   * @returns
   */
  async uploadDocument(
    userId: string,
    imageBlob: Express.Multer.File,
    docName: string,
  ): Promise<string> {
    const folderPath = `${this.rootFolder}/${userId}/${this.documentFolder}/${docName}/${imageBlob.originalname}`;
    const documentUrl = await this.awsS3Service.uploadImgToFolder(
      folderPath,
      imageBlob.buffer,
    );
    return documentUrl;
  }
}
