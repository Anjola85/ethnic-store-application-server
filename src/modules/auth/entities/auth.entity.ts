import { EntityMobileDto } from 'src/common/dto/mobile.dto';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('auth')
export class Auth extends CommonEntity {
  @Column({ unique: true, default: '' })
  email: string;

  @Column({ type: 'jsonb', nullable: true, unique: true })
  mobile: EntityMobileDto;

  @Column({ type: 'boolean', default: false })
  account_verified: boolean;

  @Column({ default: null })
  verification_code: string;

  @Column()
  verification_code_expiration: Date;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
