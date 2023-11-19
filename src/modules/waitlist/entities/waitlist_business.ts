import { MobileDto } from 'src/common/dto/mobile.dto';
import { Address } from 'src/modules/address/entities/address.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('waitlist_business')
export class WaitlistBusiness extends CommonEntity {
  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'varchar', name: 'email' })
  email: string;

  @Column({ type: 'varchar', name: 'mobile' })
  mobile: MobileDto;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;
}
