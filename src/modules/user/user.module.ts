import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { Customer, CustomerSchema } from './entities/customer.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { Merchant, MerchantSchema } from './entities/merchant.entity';
import { User, UserSchema } from './entities/user.entity';
import { UserAccountService } from '../user_account/user_account.service';
import {
  UserAccount,
  UserAccountSchema,
} from '../user_account/entities/user_account.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Customer.name, schema: CustomerSchema },
      { name: Merchant.name, schema: MerchantSchema },
      { name: UserAccount.name, schema: UserAccountSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, UserAccountService],
})
export class UserModule {}
