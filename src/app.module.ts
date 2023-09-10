import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
import { UserAccountModule } from './modules/user_account/user_account.module';
import { DatabseModule } from './modules/database/database.module';
import { CategoryModule } from './modules/category/category.module';
import { BusinessModule } from './modules/business/business.module';
import { CountryModule } from './modules/country/country.module';
import { ContinentModule } from './modules/continent/continent.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AuthMiddleware } from './middleware/auth.middleware';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from './modules/auth/auth.module';
import { SendgridModule } from './providers/otp/sendgrid/sendgrid.module';
import { BullModule } from '@nestjs/bull';
import { TwilioModule } from 'nestjs-twilio';
import { FavouriteModule } from './modules/favourite/favourite.module';
import { ImagesModule } from './modules/images/images.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { Business } from './modules/business/entities/business.entity';
import { Country } from './modules/country/entities/country.entity';
import { Continent } from './modules/continent/entities/continent.entity';
import { Category } from './modules/category/entities/category.entity';
import { Address } from './modules/user/entities/address.entity';
import { Auth } from './modules/auth/entities/auth.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['config/.env'],
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.PG_HOST,
      port: Number(process.env.PG_PORT),
      username: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
      entities: [User, Business, Country, Continent, Category, Address, Auth],
      synchronize: true,
      // ssl: {
      //   rejectUnauthorized: false, // Allows self-signed certificates (use with caution in production)
      // },
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TwilioModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        accountSid: configService.get<string>('TWILIO_ACCOUNT_SID'),
        authToken: configService.get<string>('TWILIO_AUTH_TOKEN'),
      }),
      inject: [ConfigService],
    }),
    SendgridModule,
    DatabseModule,
    AuthModule,
    UserModule,
    UserAccountModule,
    BusinessModule,
    CategoryModule,
    CountryModule,
    ContinentModule,
    ReviewsModule,
    FavouriteModule,
    ImagesModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        'user/register',
        'business/nearby',
        'business/register',
        'business/all',
        'auth/login',
        'auth/test',
        'auth/sendOtp',
        'auth/resendOtp',
        'auth/sendOTPBySms',
        'auth/reset',
        'auth/encrypt',
        'auth/decrypt',
        'images/upload',
        'images/test',
        'images/upload-s3',
      )
      .forRoutes('*');
  }
}
