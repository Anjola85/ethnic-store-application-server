import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';

@Entity()
export class Feedback extends CommonEntity {
  @Column('varchar', { length: 1000 })
  content: string;

  @Column('double precision', { default: 0 })
  rating: number;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}
