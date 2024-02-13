/**
 * @see
 * This class represents the category a business belongs to.
 * Examples are grocery, service and restaurants.
 */
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

export type CategoryDocument = Category & Document;

export interface CategoryParams {
  id: string;
  name: string;
  value: string;
}

@Entity('categories')
export class Category extends CommonEntity {
  @Column({ unique: true })
  name: string;
}
