import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { TwilioModule } from 'nestjs-twilio';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoInterceptor } from './interceptors/crypto.interceptor';
import { AuthMiddleware } from './middleware/auth.middleware';
import { DecryptionMiddleware } from './middleware/decryption.middleware';
import { AddressModule } from './modules/address/address.module';
import { AuthModule } from './modules/auth/auth.module';
import { BusinessModule } from './modules/business/business.module';
import { CategoryModule } from './modules/category/category.module';
import { EnvConfigService, isProduction } from './config/env-config';
import { ContinentModule } from './modules/continent/continent.module';
import { CountryModule } from './modules/country/country.module';
import { FavouriteModule } from './modules/favourite/favourite.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { RegionModule } from './modules/region/region.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { UserModule } from './modules/user/user.module';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { SendgridModule } from './providers/otp/sendgrid/sendgrid.module';
import { FeedbackModule } from './modules/feedback/feedback.module';
import { StoreSuggestionModule } from './modules/store-suggestion/store-suggestion.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      // {
      //   name: 'short',
      //   ttl: 10,
      //   limit: 5,
      // },
      // {
      //   name: 'medium',
      //   ttl: 60,
      //   limit: 20,
      // },
      // {
      //   name: 'long',
      //   ttl: 60,
      //   limit: 10,
      // },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['config/.env'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [],
      useFactory: (): TypeOrmModuleOptions => {
        const typeOrmConfig: TypeOrmModuleOptions = {
          type: 'postgres',
          host: EnvConfigService.get('DB_HOST'),
          port: Number(EnvConfigService.get('DB_PORT')),
          username: EnvConfigService.get('DB_USER'),
          password: EnvConfigService.get('DB_PASSWORD'),
          database: EnvConfigService.get('DB_NAME'),
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          // synchronize: isProduction() ? false : true,
          synchronize: true,
          ssl: { rejectUnauthorized: false },
        };

        // if (isProduction()) {
        //   typeOrmConfig = {
        //     ...typeOrmConfig,
        //     ssl: { rejectUnauthorized: false },
        //   };
        // }

        return typeOrmConfig;
      },
    }),

    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    TwilioModule.forRootAsync({
      imports: [],
      useFactory: () => ({
        accountSid: EnvConfigService.get('TWILIO_ACCOUNT_SID'),
        authToken: EnvConfigService.get('TWILIO_AUTH_TOKEN'),
      }),
    }),
    UserModule,
    SendgridModule,
    AuthModule,
    BusinessModule,
    CategoryModule,
    CountryModule,
    ContinentModule,
    ReviewsModule,
    FavouriteModule,
    FavouriteModule,
    AddressModule,
    WaitlistModule,
    MobileModule,
    RegionModule,
    FeedbackModule,
    StoreSuggestionModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    EnvConfigService,
    JwtService,
    {
      provide: 'APP_GUARD',
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CryptoInterceptor,
    },
  ],
  exports: [EnvConfigService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Authenticate users for these routes except for the ones mentioned in exclude
    consumer
      .apply(AuthMiddleware)
      .exclude(
        '/',
        'auth/request-login',
        'auth/request-signup',
        'test/*',
        'business/register', // TODO-MVP => REMOVE THIS because business owner must be logged in to register a business
        'business/all',
        'business/nearby',
        'business/list',
        'country/register',
        'country/all',
        'continent/register',
        'continent/all',
        'region/register',
        'region/all',
        'category/register',
        'category/all',
        'country/all-info',
        'waitlist/join-customer',
        'waitlist/join-shopper',
        'waitlist/join-business',
      )
      .forRoutes('*');

    // Decrypt every payload request made to routes except for the ones mentioned in exclude
    consumer
      .apply(DecryptionMiddleware)
      .exclude(
        'auth/encrypt',
        'auth/decrypt',
        'waitlist/*',
        'business/register',
        'auth/verifyOtp',
      )
      .forRoutes('*');
  }
}
