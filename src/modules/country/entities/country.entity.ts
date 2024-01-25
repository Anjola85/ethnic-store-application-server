import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Continent } from 'src/modules/continent/entities/continent.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type CountryDocument = Country & Document;

@Entity('countries')
export class Country extends CommonEntity {
  @Column()
  name: string;

  @ManyToOne(() => Continent, (continent) => continent.name)
  @JoinColumn()
  continent: Continent;
}
