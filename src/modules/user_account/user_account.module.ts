import { Module } from '@nestjs/common';
import { UserAccountService } from './user_account.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccount, UserAccountSchema } from './entities/user_account.entity';
import {
  TempUserAccount,
  TempUserAccountSchema,
} from './entities/temporary_user_account.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserAccount.name, schema: UserAccountSchema },
      { name: TempUserAccount.name, schema: TempUserAccountSchema },
    ]),
  ],
  providers: [UserAccountService],
  exports: [UserAccountService],
})
export class UserAccountModule {}
