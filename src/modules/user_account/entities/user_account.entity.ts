// import { Prop, Schema, SchemaFactory, raw } from '@nestjs/mongoose';
// import { AddressDto } from 'src/common/dto/address.dto';

// export type UserAccountDocument = UserAccount & Document;

// @Schema({
//   timestamps: true,
//   autoCreate: true,
//   toObject: {
//     virtuals: true,
//   },
//   toJSON: {
//     virtuals: true,
//   },
// })
// export class UserAccount {
//   @Prop({
//     type: String,
//     required: true,
//   })
//   firstname: string;

//   @Prop({
//     type: String,
//     required: true,
//   })
//   lastname: string;

//   @Prop({
//     type: String,
//     required: false,
//   })
//   email: string;

//   @Prop({
//     type: {
//       primary: {
//         type: {
//           unit: { type: String, required: false, default: '' },
//           street: { type: String, required: true, default: '' },
//           city: { type: String, required: true, default: '' },
//           province: { type: String, required: true, default: '' },
//           postalCode: { type: String, required: true, default: '' },
//           country: { type: String, required: true, default: '' },
//         },
//         required: true,
//         default: '',
//       },
//       other: {
//         type: Map,
//         of: {
//           type: {
//             unit: { type: String, required: false, default: '' },
//             street: { type: String, required: true, default: '' },
//             city: { type: String, required: true, default: '' },
//             province: { type: String, required: true, default: '' },
//             postalCode: { type: String, required: true, default: '' },
//             country: { type: String, required: true, default: '' },
//           },
//           required: false,
//           default: {},
//         },
//       },
//     },
//     required: true,
//   })
//   address: {
//     primary: AddressDto;
//     other?: {
//       [key: string]: AddressDto;
//     };
//   };

//   @Prop(
//     raw({
//       phone_number: { type: String },
//       country_code: { type: String, required: false, default: '+1' },
//       iso_type: { type: String, required: false, default: 'CA' },
//     }),
//   )
//   mobile: { phone_number: string; country_code?: string; iso_type?: string };

//   @Prop({
//     type: Boolean,
//     default: true,
//   })
//   active: boolean;

//   @Prop({
//     type: Boolean,
//     default: false,
//     select: false,
//   })
//   deleted: boolean;
// }

// const UserAccountSchema = SchemaFactory.createForClass(UserAccount);

// UserAccountSchema.statics.config = () => {
//   return {
//     idToken: 'acc',
//     hiddenFields: ['deleted'],
//   };
// };

// export { UserAccountSchema };
