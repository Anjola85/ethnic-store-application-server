import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
import { Grocery } from './grocery.entity';
import { Restaurant } from './restaurant.entity';
import { Service } from './service.entity';
import { Types } from 'mongoose';
import { Merchant } from 'src/modules/user/entities/merchant.entity';
import { Category } from 'src/modules/category/entities/category.entity';
import { Continent } from 'src/modules/continent/entities/continent.entity';
import { ContinentType } from 'src/modules/continent/continentType.enum';
import { Review } from 'src/modules/reviews/entities/review.entity';
import { CategoryType } from 'src/modules/category/categoryType.enum';

export type BusinessDocument = Business & Document;
export type CategoryTypes = Grocery | Restaurant | Service;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Business {
  /**
   * The merchantID this business belongs to
   */
  @Prop({
    type: Types.ObjectId,
    default: null,
    required: false,
    ref: 'Merchant',
  })
  merchantId: string | Merchant;

  @Prop({
    type: {
      id: { type: Types.ObjectId, required: true, refpath: 'Category' },
      name: {
        type: String,
        required: true,
        enum: Object.values(CategoryType),
      },
    },
  })
  category: { id: string; name: string };

  @Prop({
    type: {
      id: { type: Types.ObjectId, required: true, ref: 'Continent' },
      name: {
        type: String,
        required: true,
        enum: Object.values(ContinentType),
      },
    },
  })
  continent: { id: string; name: string };

  @Prop({
    type: {
      id: { type: Types.ObjectId, required: true, ref: 'Country' },
      name: { type: String, required: true },
    },
  })
  country: { id: string; name: string };

  /**
   * This field allows a business to be associated with one or more countries.
   * It takes in a list of country objects, where each object has an ID and a name.
   * The ID is a reference to the unique identifier of a country in the 'Country' collection.
   * The name is the name of the country.
   */
  @Prop({
    type: [
      {
        id: { type: Types.ObjectId, required: true, ref: 'Country' },
        name: { type: String, required: true },
      },
    ],
    default: [],
  })
  countries: {
    id: string;
    name: string;
  }[];

  /**
   * The reviewsID the business belongs to
   */
  @Prop({
    type: Types.ObjectId,
    default: null,
    required: false,
    ref: 'Review',
  })
  reviewId: string | Review;

  /**
   * Business name
   */
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  /**
   * Address of the business
   */
  @Prop({
    type: {
      unit: { type: String, required: false, default: '' },
      street: { type: String, required: true, default: '' },
      city: { type: String, required: true, default: '' },
      province: { type: String, required: true, default: '' },
      postalCode: { type: String, required: true, default: '' },
      country: { type: String, required: true, default: '' },
    },
    required: true,
  })
  address: {
    street: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };

  @Prop({
    type: String,
    required: true,
  })
  email: string;

  @Prop(
    raw({
      phoneNumber: { type: String, required: true },
      iso_code: { type: String, required: true, default: '+1' },
    }),
  )
  mobile: { phoneNumber: string; iso_code?: string };

  @Prop({
    type: String,
    required: true,
  })
  description: string;

  @Prop({
    type: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    default: {},
  })
  schedule: {
    monday?: { open: string; close: string };
    tuesday?: { open: string; close: string };
    wednesday?: { open: string; close: string };
    thursday?: { open: string; close: string };
    friday?: { open: string; close: string };
    saturday?: { open: string; close: string };
    sunday?: { open: string; close: string };
  };

  @Prop({
    type: String,
    required: false,
  })
  website: string;

  @Prop({
    type: String,
    required: true,
  })
  rating: string;

  @Prop({
    type: {
      featured: { type: String },
      background: { type: String },
    },
    default: {},
  })
  images: { featured?: string; background?: string };

  @Prop({
    type: String,
    required: true,
  })
  navigationUrl: string;

  @Prop({
    type: String,
    required: true,
  })
  googlePlaceId: string;

  @Prop({
    type: {
      latitude: { type: String },
      longitude: { type: String },
    },
    required: true,
  })
  geolocation: { latitude: string; longitude: string };

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const BusinessSchema = SchemaFactory.createForClass(Business);

BusinessSchema.statics.config = () => {
  return {
    idToken: 'business',
    hiddenFields: ['deleted'],
  };
};

export { BusinessSchema };
