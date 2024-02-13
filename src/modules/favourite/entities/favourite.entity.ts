import { Business } from 'src/modules/business/entities/business.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';

@Entity('favourite')
export class Favourite extends CommonEntity {
  @ManyToOne(() => Business, (business) => business.favourites)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @ManyToOne(() => User, (user) => user.favourites)
  @JoinColumn({ name: 'user_id ' })
  user: User;
}
