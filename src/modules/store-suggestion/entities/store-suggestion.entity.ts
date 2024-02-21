import { Address } from 'src/modules/address/entities/address.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Column, JoinColumn, JoinTable, ManyToMany, OneToOne } from 'typeorm';

export class StoreSuggestion extends CommonEntity {
  @Column({ name: 'store_name', type: 'text' })
  storeName: string;

  @OneToOne(() => Address)
  @JoinColumn()
  storeAddress: Address;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}
