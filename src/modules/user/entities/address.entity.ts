import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Business } from 'src/modules/business/entities/business.entity';

export interface AddressEntity {
  primary: boolean;
  unit: string;
  street: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
}

@Entity('address')
export class Address extends CommonEntity {
  @OneToOne(() => Business, (business) => business.id, { nullable: true })
  @JoinColumn()
  business: Business;

  @ManyToOne(() => User, (user) => user.addresses, { nullable: true })
  @JoinColumn()
  user: User;

  @Column()
  primary: boolean;

  @Column()
  unit: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  province: string;

  @Column()
  postal_code: string;

  @Column()
  country: string;
}
