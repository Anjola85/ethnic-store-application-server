import { Country } from 'src/modules/country/entities/country.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';

import { User } from 'src/modules/user/entities/user.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { Mobile } from 'src/modules/mobile/mobile.entity';
import { Favourite } from 'src/modules/favourite/entities/favourite.entity';
import { ScheduleDto } from '../dto/schedule.dto';
import { MobileDto } from 'src/contract/version1/request/dto';

export interface BusinessParam {
  name?: string;
  email?: string;
  businessId?: string;
}

@Entity('business')
export class Business extends CommonEntity {
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ type: 'varchar', default: '', unique: true, nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  schedule: ScheduleDto;

  @Column({ type: 'varchar', default: '' })
  website: string;

  @Column({ type: 'text', default: '3.0' })
  rating: string;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;

  @OneToMany(() => Mobile, (mobile) => mobile.business)
  mobiles: Mobile[];

  @Column({ name: 'business_type', type: 'varchar', default: 'grocery' })
  businessType: string;

  @OneToMany(() => Favourite, (favourite) => favourite.business)
  favourites: Favourite[];

  @ManyToOne(() => User, (user) => user.business)
  @JoinColumn()
  owner: User;

  @ManyToOne(() => Country, (country) => country.name)
  @JoinColumn({ name: 'primary_country' })
  primaryCountry: Country;

  @ManyToMany(() => Country, (country) => country.name)
  @JoinColumn({ name: 'other_countries' })
  otherCountries: Country[];

  //TODO: change nullable to false, replace with dummy store image from AWS S3
  // @Column({ name: 'featured_image', type: 'varchar', nullable: true })
  // featuredImage: string;

  @Column({ name: 'background_image', type: 'varchar', nullable: true })
  backgroundImage: string;

  @Column({ name: 'profile_image', type: 'varchar', nullable: true })
  profileImage: string;
}
