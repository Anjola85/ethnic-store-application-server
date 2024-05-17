import * as dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { UserDto } from './modules/user/dto/user.dto';
import { initializeAppDataSource } from './config/app-data-source';

async function bootstrap() {
  await initializeAppDataSource(); // Initialize database

  const app = await NestFactory.create(AppModule);

  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  configureCors(app);
  setupSwagger(app);

  await app.listen(7080, '0.0.0.0', () =>
    new Logger().log(`\n[QuickMart Server] - Listening on port 7080`),
  );
}

function configureCors(app) {
  const corsOptions = {
    origin: '*',
    methods:
      process.env.ENV === 'staging'
        ? 'GET,HEAD,PUT,PATCH,POST,DELETE'
        : 'GET,HEAD,PUT,PATCH,POST',
    credentials: true,
  };
  app.enableCors(corsOptions);
}

function setupSwagger(app) {
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
  SwaggerModule.setup('api', app, document);
}

bootstrap();
