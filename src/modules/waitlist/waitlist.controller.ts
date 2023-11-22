import { WaitlistShopper } from './entities/waitlist_shopper';
import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';
import { WaitlistCustomer } from './entities/waitlist_customer.entity';
import { decryptKms } from 'src/common/util/crypto';
import { WaitlistBusinessDto } from './dto/waitlist_business.dto';
import { createResponse } from 'src/common/util/response';
import { WaitlistCustomerDto } from './dto/waitlist_customer.dto';
import { Throttle } from '@nestjs/throttler';
import { WaitlistShopperDto } from './dto/waitlist_shopper.dto';
import axios from 'axios';
import {
  businessValidation,
  customerValidation,
  isValidPhoneNumber,
  shopperValidation,
} from './validation/validation';

@Controller('waitlist')
export class WaitlistController {
  private readonly logger = new Logger(WaitlistController.name);
  constructor(private readonly waitlistService: WaitlistService) {}

  @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-customer')
  async joinCustomerWaitlist(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join customer waitlist endpoint called with body: ' + body,
      );

      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      // pass custom validation
      customerValidation(decryptedBody);

      const waitlistCustomer = new WaitlistCustomerDto();
      Object.assign(waitlistCustomer, decryptedBody);

      if (isValidPhoneNumber(waitlistCustomer.mobile.phoneNumber) === false) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse('Invalid phone number', null, false));
      }

      await this.waitlistService.joinCustomerWaitlist(waitlistCustomer);

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('customer added'));
    } catch (err: any) {
      this.logger.error(
        'Error in joinCustomerWaitlistMethod, with error ' + err,
      );

      if (err.message === 'Customer already exists') {
        return res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('customer already exists', null, false));
      } else if (err.message.includes('required')) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse(err.message, null, false));
      }

      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createResponse('Internal Server Error', null, false));
    }
  }

  @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-shopper')
  async joinShopperWaitlist(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join shopper waitlist endpoint called with body: ' + body,
      );

      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      shopperValidation(decryptedBody);

      const waitlistShopper = new WaitlistShopperDto();
      Object.assign(waitlistShopper, decryptedBody);

      if (isValidPhoneNumber(waitlistShopper.mobile.phoneNumber) === false) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse('Invalid phone number', null, false));
      }

      await this.waitlistService.joinShopperWaitlist(waitlistShopper);

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('shopper added'));
    } catch (err) {
      this.logger.error(
        'Error in joinShopperWaitlist, with message ' +
          err.message +
          ' and error: ' +
          err,
      );

      if (err.message === 'Shopper already exists') {
        return res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('shopper already exists', null, false));
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('Internal Server Error', null, false));
      }
    }
  }

  @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-business')
  async joinBusinessWaitlist(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join business waitlist endpoint called with body: ' + body,
      );

      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      businessValidation(decryptedBody);

      const waitlistBusiness = new WaitlistBusinessDto();
      Object.assign(waitlistBusiness, decryptedBody);

      await this.waitlistService.joinBusinessWaitlist(waitlistBusiness);

      return res
        .status(HttpStatus.CREATED)
        .json(createResponse('business added'));
    } catch (err) {
      this.logger.error(
        'Error in joinBusinessWaitlist, with message ' +
          err.message +
          ' and error: ' +
          err,
      );

      if (err.message === 'Business already exists') {
        return res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('business already exists', null, false));
      } else {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('Internal Server Error', null, false));
      }
    }
  }
}
