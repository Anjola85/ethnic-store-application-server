import {
  Controller,
  Post,
  UseInterceptors,
  Res,
  HttpStatus,
  UploadedFiles,
  Body,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { Response } from 'express';
import { FileFieldsInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  /**
   *
   * @param file - the image file should be less than 1MB/250KB
   * @param res
   * @returns
   */
  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'background_image', maxCount: 1 },
      { name: 'featured_image', maxCount: 1 },
      { name: 'logo_image', maxCount: 1 },
    ]),
  )
  async uploadFile(
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
    if (!files.background_image && !files.background_image[0]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No background image received',
      });
    }
    if (!files.featured_image && !files.featured_image[0]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No featured image received',
      });
    }
    if (!files.logo_image && !files.logo_image[0]) {
      return res.status(HttpStatus.BAD_REQUEST).json({
        success: false,
        message: 'No logo image received',
      });
    }

    try {
      // Validate each file, check type and size
      this.imagesService.validateImageFile(files.background_image[0]);
      this.imagesService.validateImageFile(files.featured_image[0]);
      this.imagesService.validateImageFile(files.logo_image[0]);
      const buiness_id: string = body.businessId;

      const resp = await this.imagesService.uploadImageToS3({
        buiness_id,
        background_blob: files.background_image[0],
        feature_image_blob: files.featured_image[0],
        logo_blob: files.logo_image[0],
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
