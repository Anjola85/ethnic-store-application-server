import { UserFileService } from './user-files.service';
import {
  Controller,
  Post,
  UseInterceptors,
  Res,
  HttpStatus,
  UploadedFiles,
  Body,
  Get,
} from '@nestjs/common';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { BusinessFilesService } from './business-files.service';

@Controller('images')
export class ImagesController {
  constructor(
    private readonly businessFileServices: BusinessFilesService,
    private readonly userFileService: UserFileService,
  ) {}

  @Post('upload-avatar')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'avatar_image', maxCount: 1 }]),
  )
  async uploadAvatar(
    @UploadedFiles()
    files: {
      avatar_image: Express.Multer.File[];
    },
    @Res()
    res: Response,
  ) {
    // Check if files were uploaded
    if (!files) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No images received',
      });
    }
    if (!files.avatar_image && !files.avatar_image[0]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No avatar image received',
      });
    }

    const resp = await this.userFileService.uploadAvatarImage(
      files.avatar_image[0],
    );

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'avatar image successfully uploaded',
      resp: resp,
    });
  }

  @Get('get-random-avatar')
  async getRandomAvatar(@Res() res: Response) {
    const resp = await this.userFileService.getRandomAvatar();

    return res.status(HttpStatus.OK).json({
      success: true,
      message: 'retrieval successful',
      resp: resp,
    });
  }

  @Post('upload-profile-picture')
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'profile_picture', maxCount: 1 }]),
  )
  async uploadProfilePicture(
    @Body() body: any,
    @UploadedFiles()
    files: {
      profile_picture: Express.Multer.File[];
    },
    @Res()
    res: Response,
  ) {
    // Check if files were uploaded
    if (!files) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No images received',
      });
    }
    if (!files.profile_picture && !files.profile_picture[0]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No profile picture received',
      });
    }

    // check if user id was received
    if (!body.user_id) {
      console.log('No user id received');
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No user id received',
      });
    }

    try {
      const user_id: number = body.user_id;
      const resp = await this.userFileService.uploadProfileImage(
        user_id,
        files.profile_picture[0],
      );

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'profile picture successfully uploaded',
        resp: resp,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }

  // test business images file uplaod: uploadBusinessImages
  @Post('upload-business-images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'background_image', maxCount: 1 },
      { name: 'featured_image', maxCount: 1 },
      { name: 'logo_image', maxCount: 1 },
    ]),
  )
  async uploadBusinessImages(
    @Body() body: any,
    @UploadedFiles()
    files: {
      background_image: Express.Multer.File[];
      featured_image: Express.Multer.File[];
      logo_image: Express.Multer.File[];
    },
    @Res()
    res: Response,
  ) {
    // Check if files were uploaded
    if (!files) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No images received',
      });
    }
    // check if business id was received
    if (!body.business_id) {
      console.log('No business id received');
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No business id received',
      });
    }

    if (!files.background_image && !files.background_image[0]) {
      console.log('No background image received');
    }
    if (!files.featured_image && !files.featured_image[0]) {
      console.log('No featured image received');
    }
    if (!files.logo_image && !files.logo_image[0]) {
      console.log('No logo image received');
    }

    // call businessFileServices.uploadBusinessImages
    try {
      const business_id: string = body.business_id;
      const resp = await this.businessFileServices.uploadBusinessImagesToS3({
        business_id,
        background_image_blob: files.background_image[0],
        profile_image_blob: files.logo_image[0],
        // featured_image_blob: files.featured_image[0],
      });

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'image successfully uploaded',
        resp: resp,
      });
    } catch (error) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: error.message,
      });
    }
  }
}
