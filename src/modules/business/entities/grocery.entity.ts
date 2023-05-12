import { SchemaFactory } from '@nestjs/mongoose';

export type GroceryDocument = Grocery & Document;

export class Grocery {}

const GrocerySchema = SchemaFactory.createForClass(Grocery);

hiddenFields: ['deleted'];

export { GrocerySchema };
