import { Prop, SchemaFactory, raw } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { User } from 'src/modules/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UserAccount } from 'src/modules/user_account/entities/user_account.entity';

export class Auth {
  @Prop({
    type: String,
    required: true,
    select: false,
  })
  public password: string;

  @Prop({
    type: Boolean,
    default: false,
  })
  public account_verified: boolean;

  @Prop({
    type: String,
  })
  public verification_code: string;

  @Prop({
    type: Date,
  })
  public verify_code_expiration: Date;

  @Prop({
    type: String,
  })
  public password_reset: string;

  @Prop({
    type: String,
  })
  public password_reset_code: string;

  @Prop({
    type: Date,
  })
  public reset_code_expiration: Date;

  @Prop({
    type: Boolean,
    default: false,
  })
  public change_password: boolean;

  @Prop({
    type: Types.ObjectId,
    ref: 'User',
  })
  user: any | User;

  @Prop({
    type: Types.ObjectId,
    ref: 'Auth',
  })
  account: any | UserAccount;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  public delete: boolean;
}

const AuthSchema = SchemaFactory.createForClass(Auth);

AuthSchema.pre('save', async function (next) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

AuthSchema.statics.config = () => {
  return {
    idToken: 'auth',
    fillables: [
      'email',
      'password',
      'change_password',
      'verification_code',
      'password_reset_code',
    ],
    hiddenFields: [
      'password',
      'deleted',
      'verify_code_expiration',
      'verification_code',
      'password_reset_code',
    ],
  };
};

export { AuthSchema };
