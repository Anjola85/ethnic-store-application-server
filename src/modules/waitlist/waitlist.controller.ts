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

@Controller('waitlist')
export class WaitlistController {
  private readonly logger = new Logger(WaitlistController.name);
  constructor(private readonly waitlistService: WaitlistService) {}

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

      const waitlistCustomer = new WaitlistCustomer();
      Object.assign(waitlistCustomer, decryptedBody);

      await this.waitlistService.joinCustomerWaitlist(waitlistCustomer);

      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'user added', data: null });
    } catch (err) {
      console.log(err);
    }
  }

  @Post('join-shopper')
  async joinShopperWaitlist(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join customer waitlist endpoint called with body: ' + body,
      );

      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      const waitlistShopper = new WaitlistShopper();
      Object.assign(waitlistShopper, decryptedBody);

      await this.waitlistService.joinShopperWaitlist(waitlistShopper);

      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'shopper added', data: null });
    } catch (err) {
      console.log(err);
    }
  }

  @Post('join-business')
  async joinBusinessWaitlist(
    @Body() body: any,
    @Res() res: Response,
  ): Promise<any> {
    try {
      this.logger.debug(
        'join customer waitlist endpoint called with body: ' + body,
      );

      const decryptedBody = await decryptKms(body.payload);
      this.logger.debug('decrypted body: ' + decryptedBody);

      const waitlistBusiness = new WaitlistBusinessDto();
      Object.assign(waitlistBusiness, decryptedBody);

      await this.waitlistService.joinBusinessWaitlist(waitlistBusiness);

      return res
        .status(HttpStatus.CREATED)
        .json({ message: 'business added', data: null });
    } catch (err) {
      console.log(err);
    }
  }
}
