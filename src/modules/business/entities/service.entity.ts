import { SchemaFactory } from '@nestjs/mongoose';

export type ServiceDocument = Service & Document;

export class Service {}

const ServiceSchema = SchemaFactory.createForClass(Service);

hiddenFields: ['deleted'];

export { ServiceSchema };
