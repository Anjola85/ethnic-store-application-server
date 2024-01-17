import { Business } from 'src/modules/business/entities/business.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CommonEntity } from '../common/base.entity';
import { Auth } from '../auth/entities/auth.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

export interface MobileParams {
  mobile?: MobileDto;
  auth?: string | Auth;
  business?: string | Business;
}

@Entity('mobile')
export class Mobile extends CommonEntity {
  @Column({ name: 'phone_number', type: 'varchar' })
  phoneNumber: string;

  @Column({ name: 'country_code', type: 'varchar' })
  countryCode: string;

  @Column({ name: 'iso_type', type: 'varchar' })
  isoType: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;

  @ManyToOne(() => Auth, (auth) => auth.mobile, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  auth: Auth;

  @ManyToOne(() => Business, (business) => business.id, { nullable: true })
  business: Business;
}
