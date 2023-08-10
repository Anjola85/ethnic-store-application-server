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
    console.log('recieved file in the form: ', file);

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

  // @Post()
  // create(@Body() createImageDto: CreateImageDto) {
  //   return this.imagesService.create(createImageDto);
  // }

  // @Get()
  // findAll() {
  //   return this.imagesService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.imagesService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateImageDto: UpdateImageDto) {
  //   return this.imagesService.update(+id, updateImageDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.imagesService.remove(+id);
  // }
}
