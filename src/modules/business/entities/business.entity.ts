import { Country } from 'src/modules/country/entities/country.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
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
import { Region } from 'src/modules/region/entities/region.entity';

export interface BusinessParam {
  name?: string;
  email?: string;
  businessId?: string;
}

@Entity('business')
export class Business extends CommonEntity {
  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ type: 'text', default: null })
  description: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', default: null })
  website: string;

  @Column({ type: 'text', default: '3.8' })
  rating: string;

  @OneToOne(() => Address, (address) => address.business, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  address: Address;

  @OneToOne(() => Mobile, (mobile) => mobile.business, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  mobile: Mobile;

  @OneToMany(() => Favourite, (favourite) => favourite.business, {
    cascade: true,
    onDelete: 'CASCADE',
    eager: true,
  })
  favourites: Favourite[];

  @ManyToOne(() => User, (user) => user.business)
  @JoinColumn()
  owner: User;

  @Column({ name: 'business_type', type: 'varchar', default: 'grocery' })
  businessType: string;

  // @ManyToOne(() => Country, (country) => country.name)
  // @JoinColumn({ name: 'primary_country' })
  // primaryCountry: Country;

  @ManyToMany(() => Country, (country) => country.businesses)
  countries: Country[];

  @ManyToMany(() => Region, (region) => region.businesses)
  regions: Region[];

  @Column({ type: 'jsonb', nullable: true })
  schedule: ScheduleDto;

  @Column({ name: 'background_image', type: 'varchar', nullable: true })
  backgroundImage: string;

  @Column({ name: 'profile_image', type: 'varchar', nullable: true })
  profileImage: string;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseFields() {
    this.name = this.name && this.name.toLowerCase();
    this.description = this.description && this.description.toLowerCase();
    this.email = this.email && this.email.toLowerCase();
    this.website = this.website && this.website.toLowerCase();
    this.rating = this.rating && this.rating.toLowerCase();
    this.businessType = this.businessType && this.businessType.toLowerCase();
  }
}
