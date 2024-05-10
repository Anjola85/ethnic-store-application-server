import { Address } from 'src/modules/address/entities/address.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
} from 'typeorm';

@Entity('store_suggestion')
export class StoreSuggestion extends CommonEntity {
  @Column('varchar', { length: 100 })
  name: string;

  @OneToOne(() => Address)
  @JoinColumn({name: 'address_id'})
  address: Address;

  @ManyToOne(() => User, (user) => user.feedbacks, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'user_id'})
  user: User;
}
