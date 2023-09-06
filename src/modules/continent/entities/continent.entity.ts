import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

export type ContinentDocument = Continent & Document;

@Entity('continents')
export class Continent extends CommonEntity {
  @Column()
  name: string;
}
