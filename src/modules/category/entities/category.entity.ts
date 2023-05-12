import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CategoryDocument = Category & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Category {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.statics.config = () => {
  return {
    idToken: 'category',
    hiddenFields: ['deleted'],
  };
};

export { CategorySchema };
