import { Prop, raw } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { UserAccount } from 'src/modules/user_account/entities/user_account.entity';
import { User } from './user.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';

export abstract class ProfileType {
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
