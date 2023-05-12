import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Merchant } from './merchant.entity';
import { Customer } from './customer.entity';
import { UserProfile } from 'src/modules/user/user.enums';

export type UserDocument = User & Document;
export type Profile = Customer | Merchant;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class User {
  @Prop({
    type: Types.ObjectId,
    default: null,
    required: false,
    ref: 'Auth',
  })
  auth: string | Auth;

  @Prop({
    type: Types.ObjectId,
    required: true,
    refpath: 'profileType',
  })
  profile: Profile;

  @Prop({
    type: String,
    required: true,
    enum: Object.values(UserProfile),
    default: 'Customer',
  })
  profileType: string;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const UserSchema = SchemaFactory.createForClass(User);

UserSchema.statics.config = () => {
  return {
    idToken: 'usr',
    hiddenFields: ['deleted'],
  };
};

export { UserSchema };
