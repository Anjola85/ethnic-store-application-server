import { Business } from 'src/modules/business/entities/business.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, JoinColumn, OneToOne } from 'typeorm';

@Entity('favourites')
export class Favourite extends CommonEntity {
  @OneToOne(() => Business, (business) => business.id)
  @JoinColumn()
  business: Business;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  user: User;
}
