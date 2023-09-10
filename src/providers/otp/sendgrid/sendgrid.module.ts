import { Module } from '@nestjs/common';
import { SendgridService } from './sendgrid.service';
import { UserService } from 'src/modules/user/user.service';
import TwilioService from '../twilio/twilio.service';
import { BullModule } from '@nestjs/bull';
import { OTPCodeGenerator } from 'src/providers/util/OTPCodeGenerator';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/modules/user/entities/user.entity';
import { Address } from 'src/modules/user/entities/address.entity';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'twilioQueue',
      redis: {
        port: 6380,
      },
    }),
    TypeOrmModule.forFeature([User, Address]),
  ],
  providers: [SendgridService, UserService, TwilioService, OTPCodeGenerator],
})
export class SendgridModule {}
