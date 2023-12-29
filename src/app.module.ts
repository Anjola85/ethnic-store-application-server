import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './modules/user/user.module';
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
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './modules/user/entities/user.entity';
import { Business } from './modules/business/entities/business.entity';
import { Country } from './modules/country/entities/country.entity';
import { Continent } from './modules/continent/entities/continent.entity';
import { Category } from './modules/category/entities/category.entity';
import { Auth } from './modules/auth/entities/auth.entity';
import { Favourite } from './modules/favourite/entities/favourite.entity';
import { AddressModule } from './modules/address/address.module';
import { Address } from './modules/address/entities/address.entity';
import { WaitlistCustomer } from './modules/waitlist/entities/waitlist_customer.entity';
import { WaitlistBusiness } from './modules/waitlist/entities/waitlist_business';
import { WaitlistShopper } from './modules/waitlist/entities/waitlist_shopper';
import { WaitlistModule } from './modules/waitlist/waitlist.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ApiExtraModels } from '@nestjs/swagger';
import { UserDto } from './modules/user/dto/user.dto';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CryptoInterceptor } from './interceptors/crypto.interceptor';

@ApiExtraModels(UserDto)
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 10,
        limit: 5,
      },
      {
        name: 'medium',
        ttl: 60,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60,
        limit: 10,
      },
    ]),
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
      entities: [
        User,
        Business,
        Country,
        Continent,
        Category,
        Address,
        Auth,
        Favourite,
        WaitlistCustomer,
        WaitlistBusiness,
        WaitlistShopper,
      ],
      // synchronize: true, // comment this out in production
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
  ],
  controllers: [AppController],
  providers: [
    AppService,
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
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(AuthMiddleware)
    //   .exclude(
    //     '/',
    //     '/test-validation',
    //     'user/register',
    //     'business/nearby',
    //     'business/register',
    //     'business/all',
    //     'auth/test',
    //     'auth/sendOtp',
    //     'auth/resendOtp',
    //     'auth/sendOTPBySms',
    //     'auth/reset',
    //     'auth/encrypt',
    //     'auth/decrypt',
    //     'images/upload',
    //     'images/test',
    //     'images/upload-s3',
    //     'images/upload-business-images',
    //     'images/upload-avatar',
    //     'images/get-random-avatar',
    //     'images/upload-profile-picture',
    //     'waitlist/join-customer',
    //     'waitlist/join-shopper',
    //     'waitlist/join-business',
    //   )
    //   .forRoutes('*');

    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        'user/info',
        'auth/verify',
        'user/signup',
        'auth/login',
        'auth/resendOtp',
      );
  }
}
