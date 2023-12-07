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
      phone_number: { type: String },
      country_code: { type: String, required: false, default: '+1' },
      iso_type: { type: String, required: false, default: 'CA' },
    }),
  )
  mobile: { phone_number: string; country_code?: string; iso_type?: string };
}

const TempUserAccountSchema = SchemaFactory.createForClass(TempUserAccount);

export { TempUserAccountSchema };
