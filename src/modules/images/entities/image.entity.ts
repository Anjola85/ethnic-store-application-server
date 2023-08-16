import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ImageDocument = Image & Document;

@Schema()
export class Image {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  data: Buffer;

  @Prop({ required: true })
  contentType: string;

  @Prop({ required: true })
  size: number;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
