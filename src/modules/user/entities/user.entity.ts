/**
 * This file currently represents the User(Customer) entity
 * TODO: this file should be broken down to customer and owner and driver.
 * This should then serve as the parent class
 */
import { CommonEntity } from 'src/modules/common/base.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { UserProfile } from '../user.enums';
import { Favourite } from 'src/modules/favourite/entities/favourite.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Auth } from 'src/modules/auth/entities/auth.entity';
import { Business } from 'src/modules/business/entities/business.entity';
import { Country } from 'src/modules/country/entities/country.entity';

@Entity('user')
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

  @OneToOne(() => Auth, (auth) => auth.user, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  auth: Auth;

  @OneToOne(() => Business, (business) => business.owner)
  business: Auth;

  @OneToMany(() => Address, (address) => address.user, { nullable: true })
  addresses: Address[];

  @OneToMany(() => Favourite, (favourite) => favourite.user)
  favourites: Favourite[];

  @OneToOne(() => Country, (country) => country.name, { nullable: true })
  @JoinColumn()
  country: Country;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseFields() {
    this.firstName = this.firstName.toLowerCase();
    this.lastName = this.lastName.toLowerCase();
    this.userProfile = this.userProfile.toLowerCase();
    this.dob = this.dob.toLowerCase();
  }
}
