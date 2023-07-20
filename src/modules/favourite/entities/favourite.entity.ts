import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Business } from 'src/modules/business/entities/business.entity';
import { Customer } from 'src/modules/user/entities/customer.entity';

export type FavouriteDocument = Favourite & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Favourite {
  @Prop({
    type: Types.ObjectId,
    default: null,
    ref: 'Business',
  })
  businessId: string | Business;

  @Prop({
    type: Types.ObjectId,
    default: null,
    ref: 'Customer',
  })
  customerId: string | Customer;

  @Prop({
    type: Boolean,
    default: false,
  })
  deleted: boolean;
}

const FavouriteSchema = SchemaFactory.createForClass(Favourite);

FavouriteSchema.statics.config = () => {
  return {
    idToken: 'favourite',
  };
};

export { FavouriteSchema };
