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
  other_countries: Country[];

  @OneToMany(() => Category, (category) => category.name)
  categories: Category[];

  @Column({ nullable: false })
  @Index({ unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;

  @Column()
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  mobile: { primary: EntityMobileDto; secondary: EntityMobileDto };

  @Column({ type: 'jsonb', nullable: true })
  schedule: ScheduleDto;

  @Column({ type: 'varchar', default: '' })
  website: string;

  @Column({ type: 'text', default: '3.0' })
  rating: string;

  @Column({ type: 'jsonb', nullable: false })
  images: ImagesDto;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  geolocation: GeoLocationDto;

  @Column({ type: 'varchar', default: 'grocery' })
  business_type: string;
}
