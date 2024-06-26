import { WaitlistShopper } from './entities/waitlist_shopper.entity';
import {
  Controller,
  Post,
  Body,
  Res,
  Logger,
  HttpStatus,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { Response } from 'express';
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

  // @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-customer')
  async joinCustomerWaitlist(
    @Body() reqBody: WaitlistCustomerDto,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join customer waitlist endpoint called with body: ' +
          JSON.stringify(reqBody, null, 2),
      );

      await this.waitlistService.joinCustomerWaitlist(reqBody);
      return createResponse('customer added');
    } catch (error: any) {
      this.logger.error(
        'Error in joinCustomerWaitlistMethod, with error ' + error,
      );

      if (error instanceof ConflictException) {
        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + error,
        );

        throw new ConflictException('customer already exists');
      } else if (error.message.includes('required')) {
        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + error,
        );

        throw new BadRequestException(error.message);
      } else {
        this.logger.error(
          'Error in joinCustomerWaitlistMethod, with error ' + error,
        );

        throw new InternalServerErrorException(
          error.message || 'Internal Server Error',
        );
      }
    }
  }

  // @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-shopper')
  async joinShopperWaitlist(@Body() reqBody: any): Promise<any> {
    try {
      this.logger.debug(
        'join shopper waitlist endpoint called with body: ' +
          JSON.stringify(reqBody, null, 2),
      );

      shopperValidation(reqBody);

      const waitlistShopper = new WaitlistShopperDto();
      Object.assign(waitlistShopper, reqBody);

      const resp = await this.waitlistService.joinShopperWaitlist(
        waitlistShopper,
      );

      this.logger.debug(
        'join shopper waitlist endpoint called with response: ' + resp,
      );

      return createResponse('shopper added');
    } catch (error) {
      this.logger.error('Error in joinShopperWaitlist, with error ' + error);

      let errResp;

      if (error instanceof ConflictException) {
        this.logger.error('Error in joinShopperWaitlist, with error ' + error);

        throw new ConflictException('shopper already exists');
      } else if (error.message.includes('required')) {
        this.logger.error(
          'Error in joinShopperWaitlist, with error ' + errResp,
        );

        throw new BadRequestException(error.message);
      } else {
        this.logger.error(
          'Error in joinShopperWaitlist, with error ' + errResp,
        );

        throw new InternalServerErrorException(
          error.message || 'Internal Server Error',
        );
      }
    }
  }

  // @Throttle({ default: { limit: 5, ttl: 10 } })
  @Post('join-business')
  async joinBusinessWaitlist(@Body() reqBody: any): Promise<any> {
    try {
      this.logger.debug(
        'join business waitlist endpoint called with body: ' +
          JSON.stringify(reqBody, null, 2),
      );

      businessValidation(reqBody);

      const waitlistBusiness = new WaitlistBusinessDto();
      Object.assign(waitlistBusiness, reqBody);

      await this.waitlistService.joinBusinessWaitlist(waitlistBusiness);

      return createResponse('business added');
    } catch (error) {
      this.logger.error('Error in joinBusinessWaitlist, with error ' + error);

      if (error instanceof ConflictException) {
        this.logger.error('Error in joinBusinessWaitlist, with error ' + error);
        throw new ConflictException('business already exists');
      } else if (error.message.includes('required')) {
        this.logger.error('Error in joinBusinessWaitlist, with error ' + error);

        throw new BadRequestException(error.message);
      }

      this.logger.error('Error in joinBusinessWaitlist, with error ' + error);

      throw new InternalServerErrorException(
        error.message || 'Internal Server Error',
      );
    }
  }
}
