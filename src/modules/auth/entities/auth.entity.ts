import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('auth')
export class Auth extends CommonEntity {
  @Column({ type: 'string', nullable: true })
  password: string;

  @Column({ type: 'boolean', default: false })
  account_verified: boolean;

  @Column({ type: 'number', nullable: true })
  verification_code: number;

  @Column({ type: 'timestamp', nullable: true })
  verification_code_expiration: Date;

  @OneToOne(() => User, (user) => user.id)
  user: User;
}
