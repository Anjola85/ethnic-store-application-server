/**
 * @swagger
 * definitions:
 *  Category:
 *   type: object
 *  properties:
 *   name:
 *   type: string
 * example:
 * name: "West Africa"
 *
 */
import { CommonEntity } from 'src/modules/common/base.entity';
import { Column, Entity } from 'typeorm';

export type CategoryDocument = Category & Document;

@Entity('categories')
export class Category extends CommonEntity {
  @Column()
  name: string;
}
