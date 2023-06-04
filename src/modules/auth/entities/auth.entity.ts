import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserAccount } from 'src/modules/user_account/entities/user_account.entity';

export type AuthDocument = Auth & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Auth {
  @Prop({
    type: String,
    required: false,
  })
  password: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  account_verified: boolean;

  @Prop({
    type: String,
  })
  verification_code: string;

  @Prop({
    type: Date,
  })
  verification_code_expiration: Date;

  @Prop({
    type: String,
  })
  password_reset: string;

  @Prop({
    type: String,
  })
  password_reset_code: string;

  @Prop({
    type: Date,
  })
  reset_code_expiration: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  change_password: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'Auth',
  })
  user_account_id: any | UserAccount;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  delete: boolean;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.statics.config = () => {
  return {
    idToken: 'auth',
    hiddenFields: ['deleted'],
  };
};

export { AuthSchema };
