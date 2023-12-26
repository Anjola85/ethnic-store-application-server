import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  ApiExtraModels,
} from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import rateLimit from 'express-rate-limit';
import { UserDto } from './modules/user/dto/user.dto';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalPipes(new ValidationPipe());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip all properties that don't have any decorators
      forbidNonWhitelisted: true, // Throw errors when non-whitelisted values are provided
      transform: true, // Automatically transform payloads to be objects typed according to their DTO classes
    }),
  );
  const logger = new Logger();

  const config = new DocumentBuilder()
    .setTitle('Quickmart Server')
    .setDescription('Server API description')
    .setVersion('1.0')
    .addTag('qm1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [UserDto],
  });
  // const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(7080, '0.0.0.0', () =>
    logger.log(`\n[QuickMart Server] - Listening on port 7080`),
  );
}
bootstrap();
