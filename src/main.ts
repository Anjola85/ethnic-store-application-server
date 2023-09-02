import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Quickmart Server')
    .setDescription('Server API description')
    .setVersion('1.0')
    .addTag('qm1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(7080, '0.0.0.0', () =>
    logger.log(`\n[QuickMart Server] - Listening on port 7080`),
  );
}
bootstrap();
