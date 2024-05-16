import { getCurrentEpochTime } from 'src/common/util/functions';
import {
  BaseEntity,
  BeforeInsert,
  BeforeUpdate,
  Column,
  PrimaryGeneratedColumn,
} from 'typeorm';

export class CommonEntity extends BaseEntity {
  // @PrimaryColumn({
  //   type: 'uuid',
  //   generated: 'uuid',
  // })
  // id: string;
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'boolean', default: false })
  deleted: boolean;

  @Column({
    name: 'created_at',
    type: 'bigint',
  })
  createdAt: number;

  @Column({
    name: 'updated_at',
    type: 'bigint',
  })
  updatedAt: number;

  @BeforeInsert()
  setCreationDate() {
    this.createdAt = getCurrentEpochTime();
    this.updatedAt = getCurrentEpochTime();
  }

  @BeforeUpdate()
  setUpdateDate() {
    this.updatedAt = getCurrentEpochTime();
  }
}
