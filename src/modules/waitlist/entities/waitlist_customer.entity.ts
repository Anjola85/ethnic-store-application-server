import { PhoneNumberDto } from 'src/common/dto/mobile.dto';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('waitlist_users')
export class WaitlistCustomer extends CommonEntity {
  @Column('first_name')
  firstName: string;

  @Column('last_name')
  lastName: string;

  @Column('mobile')
  mobile: PhoneNumberDto;

  @Column('email')
  email: string;

  @Column('zip_code')
  zipCode: string;
}
