import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProfileType } from './person.entity';

export type CustomerDocument = Customer & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: {
    virtuals: true,
  },
  toJSON: {
    virtuals: true,
  },
})
export class Customer extends ProfileType {}

const CustomerSchema = SchemaFactory.createForClass(Customer);

CustomerSchema.statics.config = () => {
  return {
    idToken: 'cst',
    hiddenFields: ['deleted'],
  };
};

export { CustomerSchema };
