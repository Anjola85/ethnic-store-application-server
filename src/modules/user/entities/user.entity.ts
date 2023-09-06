import { AddressDto } from 'src/common/dto/address.dto';
import { MobileDto } from 'src/common/dto/mobile.dto';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { UserProfile } from '../user.enums';
import { Business } from 'src/modules/business/entities/business.entity';

@Entity('users')
export class User extends CommonEntity {
  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column()
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  mobile: MobileDto;

  @Column({ type: 'jsonb', nullable: true })
  address: AddressDto;

  @Column({ type: 'varchar', default: UserProfile.CUSTOMER })
  user_profile: UserProfile;

  @Column()
  active: boolean;
}
