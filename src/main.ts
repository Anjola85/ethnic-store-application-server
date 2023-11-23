import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import rateLimit from 'express-rate-limit';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe());

  // const corsOptions: CorsOptions = {
  //   origin: '*',
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  //   credentials: true,
  // };

  // app.enableCors(corsOptions);

  const logger = new Logger();

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
