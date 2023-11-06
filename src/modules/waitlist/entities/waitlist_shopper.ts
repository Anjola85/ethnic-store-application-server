import { EntityMobileDto } from 'src/common/dto/mobile.dto';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('waitlist_shopper')
export class WaitlistShopper extends CommonEntity {
  @Column('first_name')
  firstName: string;

  @Column('last_name')
  lastName: string;

  @Column('mobile')
  mobile: EntityMobileDto;

  @Column('email')
  email: string;

  @Column('zip_code')
  zipCode: string;

  @Column('age')
  age: string;

  @Column('vehicle_type')
  vehicleType: string;
}
