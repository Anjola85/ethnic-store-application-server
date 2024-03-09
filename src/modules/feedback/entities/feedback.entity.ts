import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  ManyToMany,
  JoinTable,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Feedback extends CommonEntity {
  @Column('varchar', { length: 500 })
  content: string;

  @Column('double precision', { default: null })
  rating: number;

  @ManyToOne(() => User, (user) => user.feedbacks, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;
}
