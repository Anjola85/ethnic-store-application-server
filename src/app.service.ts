import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  getHello(): string {
    // const databaseUri = this.configService.get<string>('DATABASE_URI');
    return `Hello World! from Quickie server`;
  }
}