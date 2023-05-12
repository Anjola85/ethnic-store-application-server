import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
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

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['config/.env'],
    }),
    DatabseModule,
    UserModule,
    UserAccountModule,
    BusinessModule,
    CategoryModule,
    CountryModule,
    ContinentModule,
    ReviewsModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude('auth/(login|signup)')
      .forRoutes('*');
  }
}
