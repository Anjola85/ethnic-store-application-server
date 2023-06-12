import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);
  await app.listen(7080, '0.0.0.0', () =>
    logger.log(`\n[QuickMart Server] - Listening on port 7080`),
  );
}
bootstrap();
