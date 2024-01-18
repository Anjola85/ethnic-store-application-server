import { Country } from 'src/modules/country/entities/country.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DayScheduleDto, ScheduleDto } from '../dto/schedule.dto';
import { GeoLocationDto } from '../dto/geolocation.dto';
import {
  EntityMobileDto,
  MobileDto,
  MobileGroupDto,
} from 'src/common/dto/mobile.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Address } from 'src/modules/address/entities/address.entity';
import { ImagesDto, UploadedImagesDto } from '../dto/image.dto';
import { Mobile } from 'src/modules/mobile/mobile.entity';
import { Favourite } from 'src/modules/favourite/entities/favourite.entity';

@Entity('business')
export class Business extends CommonEntity {
  @Column({ nullable: false })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  schedule: ScheduleDto;

  @Column({ type: 'varchar', default: '' })
  website: string;

  @Column({ type: 'text', default: '3.0' })
  rating: string;

  @Column({ type: 'jsonb', nullable: false })
  images: ImagesDto;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;

  @OneToMany(() => Mobile, (mobile) => mobile.business)
  mobiles: Mobile[];

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geolocation: GeoLocationDto;

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

  @OneToMany(() => Category, (category) => category.name)
  categories: Category[];
}
