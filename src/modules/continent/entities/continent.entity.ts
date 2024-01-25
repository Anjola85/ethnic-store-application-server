import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

export type ContinentDocument = Continent & Document;

export interface ContinentParams {
  id: string;
  name: string;
}

@Entity('continents')
export class Continent extends CommonEntity {
  @Column()
  name: string;
}
