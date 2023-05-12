import { Prop, Schema } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { Business } from 'src/modules/business/entities/business.entity';
import { User } from 'src/modules/user/entities/user.entity';

export type ReviewDocument = Review & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Review {
  @Prop({
    type: Types.ObjectId,
    default: null,
    required: false,
    ref: 'Business',
  })
  businessId: string | Business;

  @Prop({
    type: Types.ObjectId,
    default: null,
    required: false,
    ref: 'User',
  })
  userId: string | User;

  @Prop({
    type: String,
    required: true,
  })
  comment: string;

  @Prop({
    type: String,
    required: true,
  })
  rating: string;
}
