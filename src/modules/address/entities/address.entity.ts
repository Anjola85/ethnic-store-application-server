import { Business } from 'src/modules/business/entities/business.entity';
import { CommonEntity } from 'src/modules/common/base.entity';
import { User } from 'src/modules/user/entities/user.entity';
import { Entity, OneToOne, JoinColumn, ManyToOne, Column } from 'typeorm';

@Entity('address')
export class Address extends CommonEntity {
  @OneToOne(() => Business, (business) => business.address)
  business: Business;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @Column({ default: true, nullable: false, type: 'boolean' })
  isPrimary: boolean;

  @Column({ type: 'varchar', default: '' })
  unit: string;

  @Column()
  street: string;

  @Column()
  city: string;

  @Column()
  province: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column()
  country: string;

  @Column({
    type: 'point',
    transformer: {
      from(value: string): any {
        return value; // Transform from database format to your class attribute format
      },
      to(value: any): string {
        return value; // Transform from your class attribute format to database format
      },
    },
  })
  location: string;
}
