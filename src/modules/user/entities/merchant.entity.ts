import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ProfileType } from './person.entity';

export type MerchantDocument = Merchant & Document;

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
export class Merchant extends ProfileType {
  private age: number;

  /**
   * format:  "yyyy-mm-dd"
   */
  @Prop({
    type: String,
    required: true,
  })
  dob: string;

  @Prop({
    type: String,
    required: false,
  })
  profilePicture: string;

  /**
   *
   * @returns age
   */
  private calculateAge(): string {
    const today = new Date();
    const birthDate = new Date(this.dob);
    let age = today.getFullYear() - birthDate.getFullYear();

    // calculate if user has had borthday, reduce by 1 if not
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age.toString();
  }

  /**
   * Virtual property to get age
   * Calculate age based on dob value
   */
  @Prop({
    type: String,
    get() {
      if (!this.age) {
        this.age = this.getAge();
      }
      return this.age;
    },
    set() {
      throw new Error('Age is a calculated field and cannot be set directly.');
    },
  })
  get getAge(): string {
    return this.calculateAge();
  }
}

const MerchantSchema = SchemaFactory.createForClass(Merchant);

MerchantSchema.statics.config = () => {
  return {
    idToken: 'merch',
    hiddenFields: ['deleted'],
  };
};

export { MerchantSchema };
