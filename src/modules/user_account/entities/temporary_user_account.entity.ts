import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';

export type TempUserAccountDocument = TempUserAccount & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class TempUserAccount {
  @Prop({
    type: String,
    required: false,
  })
  email: string;

  @Prop(
    raw({
      phoneNumber: { type: String },
      isoCode: { type: String, required: false, default: '+1' },
      isoType: { type: String, required: false, default: 'CA' },
    }),
  )
  mobile: { phoneNumber: string; isoCode?: string; isoType?: string };
}

const TempUserAccountSchema = SchemaFactory.createForClass(TempUserAccount);

export { TempUserAccountSchema };
