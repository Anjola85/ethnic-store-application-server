import { Business } from 'src/modules/business/entities/business.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { Continent } from 'src/modules/continent/entities/continent.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

@Entity('region')
export class Region extends CommonEntity {
  @Column({ type: 'varchar', length: 15, unique: true })
  name: string;

  @ManyToOne(() => Continent, (continent) => continent.name)
  @JoinColumn({ name: 'continent_id' })
  continentId: Continent;

  @ManyToMany(() => Business, (business) => business.regions)
  @JoinTable() // This decorator is used to specify the owner side of the relationship.
  businesses: Business[];

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseFields() {
    this.name = this.name.toLowerCase();
  }
}
