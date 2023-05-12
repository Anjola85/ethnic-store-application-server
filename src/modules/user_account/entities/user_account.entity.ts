import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';

export type UserAccountDocument = UserAccount & Document;

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
export class UserAccount {
  @Prop({
    type: String,
    required: true,
  })
  firstName: string;

  @Prop({
    type: String,
    required: true,
  })
  lastName: string;

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop({
    type: {
      unit: { type: String, required: false, default: '' },
      street: { type: String, required: true, default: '' },
      city: { type: String, required: true, default: '' },
      province: { type: String, required: true, default: '' },
      postalCode: { type: String, required: true, default: '' },
      country: { type: String, required: true, default: '' },
    },
    required: true,
  })
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  @Prop(
    raw({
      phoneNumber: { type: String },
      iso_code: { type: String, required: true, default: '+1' },
    }),
  )
  mobile: { phoneNumber: string; iso_code?: string };

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

UserAccountSchema.statics.config = () => {
  return {
    idToken: 'acc',
    hiddenFields: ['deleted'],
  };
};

export { UserAccountSchema };
