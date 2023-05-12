import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ContinentType } from 'src/modules/continent/continentType.enum';
import { Continent } from 'src/modules/continent/entities/continent.entity';

export type CountryDocument = Country & Document;

@Schema({
  timestamps: true,
  autoCreate: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
export class Country {
  @Prop({
    type: String,
    required: true,
  })
  name: string;

  /**
   * The continent Id the Country belongs to
   */
  @Prop({
    type: Types.ObjectId,
    required: true,
    refpath: 'continentType',
  })
  continentId: string | Continent;

  /**
   * The continent type the Country belongs to e.g. African
   */
  @Prop({
    type: String,
    required: true,
    enum: Object.values(ContinentType),
  })
  continentType: string;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;
}

const CountrySchema = SchemaFactory.createForClass(Country);

CountrySchema.statics.config = () => {
  return {
    idToken: 'country',
    hiddenFields: ['deleted'],
  };
};

export { CountrySchema };
