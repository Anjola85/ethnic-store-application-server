import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { UserProfile } from '../user.enums';
import { Favourite } from 'src/modules/favourite/entities/favourite.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Business } from 'src/modules/business/entities/business.entity';

@Entity('users')
export class User extends CommonEntity {
  @Column({ name: 'first_name', type: 'varchar', nullable: true })
  firstName: string;

  @Column({ name: 'last_name', type: 'varchar', nullable: true })
  lastName: string;

  @Column({
    name: 'user_profile',
    type: 'varchar',
    default: UserProfile.CUSTOMER,
  })
  userProfile: string;

  @Column({ type: 'varchar', nullable: true })
  dob: string;

  @Column({ name: 'profile_image', type: 'varchar', nullable: true })
  profileImage: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @OneToOne(() => Auth, (auth) => auth.user)
  @JoinColumn()
  auth: Auth;

  @OneToOne(() => Business, (business) => business.owner)
  business: Auth;

  @OneToMany(() => Address, (address) => address.user, { nullable: true })
  addresses: Address[];

  @OneToMany(() => Favourite, (favourite) => favourite.user)
  favourites: Favourite[];
}
