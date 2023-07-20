import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../user/entities/customer.entity';
import { Merchant, MerchantSchema } from '../user/entities/merchant.entity';
import { User, UserSchema } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Favourite, FavouriteSchema } from './entities/favourite.entity';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { Auth, AuthSchema } from '../auth/entities/auth.entity';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from '../user_account/entities/temporary_user_account.entity';
import {
  UserAccount,
  UserAccountSchema,
} from '../user_account/entities/user_account.entity';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import { AuthService } from '../auth/auth.service';
import { UserAccountService } from '../user_account/user_account.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Favourite.name, schema: FavouriteSchema },
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: Auth.name, schema: AuthSchema },
      { name: TempUserAccount.name, schema: TempUserAccountSchema },
    ]),
  ],
  controllers: [FavouriteController],
  providers: [
    FavouriteService,
    UserService,
    UserAccountService,
    AuthService,
    SendgridService,
    OTPCodeGenerator,
    TwilioService,
  ],
})
export class FavouriteModule {}
