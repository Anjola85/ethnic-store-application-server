import { WaitlistShopper } from './entities/waitlist_shopper';
import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';
import { decryptKms } from 'src/common/util/crypto';
import { WaitlistBusinessDto } from './dto/waitlist_business.dto';
import { createResponse } from 'src/common/util/response';
import { WaitlistCustomerDto } from './dto/waitlist_customer.dto';
import { Throttle } from '@nestjs/throttler';
import { WaitlistShopperDto } from './dto/waitlist_shopper.dto';
import {
  businessValidation,
  customerValidation,
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

      // decrypt body
      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      // validate input
      customerValidation(decryptedBody);

      const waitlistCustomer = new WaitlistCustomerDto();
      Object.assign(waitlistCustomer, decryptedBody);

      await this.waitlistService.joinCustomerWaitlist(waitlistCustomer);

      const resp = res
        .status(HttpStatus.CREATED)
        .json(createResponse('customer added'));

      this.logger.debug(
        'join customer waitlist endpoint called with response: ' + resp,
      );

      return resp;
    } catch (error: any) {
      this.logger.error(
        'Error in joinCustomerWaitlistMethod, with error ' + error,
      );

      let errResp;

      if (error instanceof ConflictException) {
        errResp = res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('customer already exists', null, false));

        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + error,
        );
      } else if (error.message.includes('required')) {
        errResp = res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse(error.message, null, false));

        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + errResp,
        );
      } else {
        errResp = res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('Internal Server Error', null, false));

        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + errResp,
        );
      }

      return errResp;
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

      await this.waitlistService.joinShopperWaitlist(waitlistShopper);

      const resp = res
        .status(HttpStatus.CREATED)
        .json(createResponse('shopper added'));

      this.logger.debug(
        'join shopper waitlist endpoint called with response: ' + resp,
      );

      return resp;
    } catch (error) {
      this.logger.error('Error in joinShopperWaitlist, with error ' + error);

      let errResp;

      if (error instanceof ConflictException) {
        errResp = res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('shopper already exists', null, false));

        this.logger.error('Error in joinShopperWaitlist, with error ' + error);
      } else if (error.message.includes('required')) {
        errResp = res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse(error.message, null, false));

        this.logger.error(
          'Error in joinShopperWaitlist, with error ' + errResp,
        );
      } else {
        errResp = res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('Internal Server Error', null, false));

        this.logger.error(
          'Error in joinShopperWaitlist, with error ' + errResp,
        );
      }

      return errResp;
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
    } catch (error) {
      this.logger.error('Error in joinBusinessWaitlist, with error ' + error);

      let errResp;

      if (error instanceof ConflictException) {
        errResp = res
          .status(HttpStatus.CONFLICT)
          .json(createResponse('business already exists', null, false));

        this.logger.error('Error in joinBusinessWaitlist, with error ' + error);
      } else if (error.message.includes('required')) {
        errResp = res
          .status(HttpStatus.BAD_REQUEST)
          .json(createResponse(error.message, null, false));

        this.logger.error(
          'Error in joinBusinessWaitlist, with error ' + errResp,
        );
      } else {
        errResp = res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(createResponse('Internal Server Error', null, false));

        this.logger.error(
          'Error in joinBusinessWaitlist, with error ' + errResp,
        );
      }

      return errResp;
    }
  }
}
