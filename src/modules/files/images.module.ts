import { Global, Module } from '@nestjs/common';
import { ImagesController } from './images.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Image, ImageSchema } from './entities/image.entity';
import { BusinessFilesService } from './business-files.service';
import { AwsS3Service } from './aws-s3.service';
import { UserFileService } from './user-files.service';

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Image.name, schema: ImageSchema }]),
  ],
  controllers: [ImagesController],
  providers: [BusinessFilesService, AwsS3Service, UserFileService],
})
export class ImagesModule {}
