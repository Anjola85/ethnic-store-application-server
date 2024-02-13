import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity()
export class Feedback extends CommonEntity {
  @Column()
  message: string;

  @ManyToMany(() => User)
  @JoinTable()
  users: User[];
}
