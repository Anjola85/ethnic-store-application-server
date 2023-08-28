import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { ImagesService } from './images.service';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('images')
export class ImagesController {
  constructor(private readonly imagesService: ImagesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @Res() res: Response,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<any> {
    try {
      await this.imagesService.uploadImage(file);
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'image successfully uploaded',
      });
    } catch (error) {
      console.log('error in uploadImage: ', error);
    }
  }

  @Post('test')
  async test(@Res() res: Response): Promise<any> {
    try {
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'test endpoint',
      });
    } catch (error) {
      console.log('error in test: ', error);
    }
  }
}
