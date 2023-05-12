import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type ContinentDocument = Continent & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Continent {
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

const ContinentSchema = SchemaFactory.createForClass(Continent);

ContinentSchema.statics.config = () => {
  return {
    idToken: 'continent',
    hiddenFields: ['deleted'],
  };
};

export { ContinentSchema };
