import { Business } from 'src/modules/business/entities/business.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { CommonEntity } from '../common/base.entity';
import { Auth } from '../auth/entities/auth.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

export interface MobileParams {
  mobile?: MobileDto;
  auth?: number | Auth;
  business?: number | Business;
}

@Entity('mobile')
export class Mobile extends CommonEntity {
  @ManyToOne(() => Auth, (auth) => auth.mobile, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  auth: Auth;

  @OneToOne(() => Business, (business) => business.mobile)
  business: Business;

  @Column({ name: 'phone_number', type: 'varchar', unique: true })
  phoneNumber: string;

  @Column({ name: 'country_code', type: 'varchar' })
  countryCode: string;

  @Column({ name: 'iso_type', type: 'varchar' })
  isoType: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean;
}
