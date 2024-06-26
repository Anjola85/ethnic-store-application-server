import { getCurrentEpochTime } from 'src/common/util/functions';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Mobile } from 'src/modules/mobile/mobile.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { BeforeInsert, Column, Entity, OneToMany, OneToOne } from 'typeorm';

export interface AuthParams {
  authId?: number;
  email?: string;
}

@Entity('auth')
export class Auth extends CommonEntity {
  @Column({ unique: true, default: null })
  email: string;

  @Column({ name: 'account_verified', type: 'boolean', default: false })
  accountVerified: boolean;

  @Column({ name: 'verification_code', default: null })
  otpCode: string;

  @Column({
    name: 'verification_code_expiration',
    type: 'bigint',
    default: null,
  })
  otpExpiry: number;

  // TODO: change this to be one-to-one
  @OneToMany(() => Mobile, (mobile) => mobile.auth, { nullable: true })
  mobile: Mobile;

  @OneToOne(() => User, (user) => user.auth, { nullable: true })
  user: User;
}
