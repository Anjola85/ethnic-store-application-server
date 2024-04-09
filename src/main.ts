import { Logger, ValidationPipe } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { AppModule } from './app.module';
import { EnvConfigService } from './modules/config/env-config.';
import { UserDto } from './modules/user/dto/user.dto';

dotenv.config(); // Load environment variables from .env file

async function bootstrap() {
  const envConfigService = new EnvConfigService();
  await envConfigService.loadConfig();

  const app = await NestFactory.create(AppModule);

  // const expressApp = app.getHttpAdapter().getInstance();
  // expressApp.set('trust proxy', 1);

  // validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  if (process.env.NODE_ENV === 'dev') {
    const cors: CorsOptions = {
      origin: '*', // Allow requests from all origins
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
      credentials: true,
    };
    app.enableCors(cors);
  }


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
