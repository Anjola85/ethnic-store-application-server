import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from '../user/entities/customer.entity';
import { Merchant, MerchantSchema } from '../user/entities/merchant.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { Favourite, FavouriteSchema } from './entities/favourite.entity';
import { FavouriteController } from './favourite.controller';
import { FavouriteService } from './favourite.service';
import { Auth } from '../auth/entities/auth.entity';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from '../user_account/entities/temporary-user-account.entity';
import {
  UserAccount,
  UserAccountSchema,
} from '../user_account/entities/user_account.entity';
import { AuthService } from '../auth/auth.service';
import { UserAccountService } from '../user_account/user_account.service';
import TwilioService from 'src/providers/otp/twilio/twilio.service';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';

// @Module({
//   imports: [],
//   controllers: [FavouriteController],
//   providers: [
//     FavouriteService,
//     UserService,
//     UserAccountService,
//     AuthService,
//     SendgridService,
//     OTPCodeGenerator,
//     TwilioService,
//   ],
// })
export class FavouriteModule {}
