import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ImageDocument } from './entities/image.entity';

@Injectable()
export class ImagesService {
  constructor(
    @InjectModel(Image.name) private readonly imageModel: Model<ImageDocument>,
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<void> {
    const image = new this.imageModel({
      filename: file.originalname,
      path: file.path,
    });

    await image.save();
  }

  // create(createImageDto: CreateImageDto) {
  //   return 'This action adds a new image';
  // }

  // findAll() {
  //   return `This action returns all images`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} image`;
  // }

  // update(id: number, updateImageDto: UpdateImageDto) {
  //   return `This action updates a #${id} image`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} image`;
  // }
}
