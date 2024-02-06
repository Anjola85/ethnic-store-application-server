import * as dotenv from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { UserDto } from './modules/user/dto/user.dto';
import { EnvConfigService } from './modules/config/env-config.service';
import { BootstrapService } from './modules/bootstrap/bootstrap.service';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(EnvConfigService);
  configService.validateConfig();

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Enable CORS for local testing - NGINX will handle CORS in production
  const cors: CorsOptions = {
    origin: '*', // Allow requests from all origins
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  };
  app.enableCors(cors);

  // swagger setup
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

  const logger = new Logger();

  await app.listen(7080, '0.0.0.0', () =>
    logger.log(`\n[QuickMart Server] - Listening on port 7080`),
  );
}
bootstrap();
