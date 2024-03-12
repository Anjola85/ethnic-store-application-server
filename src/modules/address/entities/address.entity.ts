import { Business } from 'src/modules/business/entities/business.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
} from 'typeorm';
import { GeometryTransformer } from '../geometry-transformer';

@Entity('address')
export class Address extends CommonEntity {
  @OneToOne(() => Business, (business) => business.address)
  business: Business;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({ default: false, nullable: false, type: 'boolean' })
  isPrimary: boolean;

  @Column({ type: 'varchar', default: '' })
  unit: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  province: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column()
  country: string;

  @Index({ spatial: true })
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
    // transformer: new GeometryTransformer(),
  })
  location: string;
}
