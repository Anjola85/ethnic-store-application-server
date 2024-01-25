import { Logger } from '@nestjs/common';

export class UserProcessor {
  private readonly logger = new Logger(UserProcessor.name);
}
