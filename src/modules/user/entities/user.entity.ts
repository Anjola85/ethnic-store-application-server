import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';
import { UserProfile } from '../user.enums';
import { Address } from './address.entity';

@Entity('users')
export class User extends CommonEntity {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @OneToMany(() => Address, (address) => address.user)
  @JoinColumn()
  addresses: Address[];

  @Column({ type: 'varchar', default: UserProfile.CUSTOMER })
  user_profile: string;

  @Column({ type: 'varchar', nullable: true })
  dob: string;

  @Column({ type: 'varchar', nullable: true })
  profile_image: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;
}
