import {
  Injectable,
  PipeTransform,
  Logger,
  ArgumentMetadata,
} from '@nestjs/common';

@Injectable()
export class LoggingPipe implements PipeTransform<any, any> {
  private readonly logger = new Logger('HTTP');

  transform(value: any, metadata: ArgumentMetadata) {
    // console.log('value: ', value);
    // console.log('metadata: ', metadata);
    return value;
  }
}
