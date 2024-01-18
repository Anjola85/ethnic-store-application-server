import { CommonEntity } from 'src/modules/common/base.entity';
import { Mobile } from 'src/modules/mobile/mobile.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';

export interface AuthParams {
  authId?: string;
  email?: string;
}

@Entity('auth')
export class Auth extends CommonEntity {
  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'account_verified', type: 'boolean', default: false })
  accountVerified: boolean;

  @Column({ name: 'verification_code', default: null })
  otpCode: string;

  @Column({ name: 'verification_code_expiration' })
  otpExpiry: Date;

  @OneToOne(() => User, (user) => user.auth)
  user: User;

  @OneToMany(() => Mobile, (mobile) => mobile.auth)
  mobile: Mobile;
}
