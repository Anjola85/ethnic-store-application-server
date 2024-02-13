import { CommonEntity } from 'src/modules/common/base.entity';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';

export type ContinentDocument = Continent & Document;

export interface ContinentParams {
  id: string;
  name: string;
}

@Entity('continent')
export class Continent extends CommonEntity {
  @Column({ type: 'varchar', nullable: false, unique: true })
  name: string;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseFields() {
    this.name = this.name && this.name.toLowerCase();
  }
}
