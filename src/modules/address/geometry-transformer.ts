import { Logger } from '@nestjs/common';
import { ValueTransformer } from 'typeorm';

export class GeometryTransformer implements ValueTransformer {
  private logger = new Logger(GeometryTransformer.name);

  to(value: any): any {
    const stringValue = JSON.stringify(value);
    this.logger.debug(`Transforming value to database format: ${stringValue}`);
    return stringValue;
  }

  from(value: string): any {
    try {
      this.logger.debug(`Transforming value from database format: ${value}`);
      return JSON.parse(value);
    } catch (e) {
      this.logger.error(`Error parsing value: ${value}`);
      return value;
    }
  }
}
