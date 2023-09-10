import { Country } from 'src/modules/country/entities/country.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { DayScheduleDto } from '../dto/schedule.dto';
import { GeoLocationDto } from '../dto/geolocation.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { User } from 'src/modules/user/entities/user.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Address } from 'src/modules/user/entities/address.entity';

@Entity('business')
export class Business extends CommonEntity {
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;

  @ManyToOne(() => Country, (country) => country.name)
  @JoinColumn()
  country: Country;

  @OneToMany(() => Country, (country) => country.name)
  @JoinColumn()
  countries: Country[];

  @Column({ nullable: false })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;

  @Column({ nullable: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  mobile: { primary: MobileDto; secondary: MobileDto };

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    monday: DayScheduleDto;
    tuesday: DayScheduleDto;
    wednesday: DayScheduleDto;
    thursday: DayScheduleDto;
    friday: DayScheduleDto;
    saturday: DayScheduleDto;
    sunday: DayScheduleDto;
  };

  @Column({ type: 'text', nullable: true })
  website: string;

  @Column({ type: 'text', default: '3.0' })
  rating: string;

  @Column({ type: 'jsonb', nullable: false })
  images: { logo: string; featured: string; background: string };

  @Column({ type: 'text', nullable: true })
  navigationUrl: string;

  @Column({ type: 'geometry', spatialFeatureType: 'Point', srid: 4326 })
  geolocation: GeoLocationDto;

  @OneToMany(() => Category, (category) => category.name)
  categories: Category[];

  @Column({ type: 'varchar', default: 'grocery' })
  businessType: string;
}
