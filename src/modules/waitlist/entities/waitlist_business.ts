import { PhoneNumberDto } from 'src/common/dto/mobile.dto';
import { Address } from 'src/modules/address/entities/address.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity('waitlist_business')
export class WaitlistBusiness extends CommonEntity {
  @Column('name')
  name: string;

  @Column('email')
  email: string;

  @Column('mobile')
  mobile: PhoneNumberDto;

  @OneToOne(() => Address, (address) => address.id)
  address: Address;

  @Column('type')
  type: string;
}
