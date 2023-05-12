import { SchemaFactory } from '@nestjs/mongoose';

export type RestaurantDocument = Restaurant & Document;

export class Restaurant {}

const RestaurantSchema = SchemaFactory.createForClass(Restaurant);

hiddenFields: ['deleted'];

export { RestaurantSchema };
