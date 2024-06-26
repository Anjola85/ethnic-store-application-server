import { MobileDto } from 'src/common/dto/mobile.dto';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('waitlist_shopper')
export class WaitlistShopper extends CommonEntity {
  @Column({ type: 'varchar', name: 'first_name' })
  firstname: string;

  @Column({ type: 'varchar', name: 'last_name' })
  lastname: string;

  @Column({ type: 'varchar', name: 'mobile' })
  mobile: MobileDto;

  @Column({ type: 'varchar', name: 'email' })
  email: string;

  @Column({ type: 'varchar', name: 'zip_code' })
  zipCode: string;

  @Column({ type: 'varchar', name: 'age' })
  age: string;

  @Column({ type: 'varchar', name: 'country', default: null })
  country: string;

  @Column({ type: 'varchar', name: 'waitlist_uuid', nullable: true })
  waitlist_uuid: string;
}
