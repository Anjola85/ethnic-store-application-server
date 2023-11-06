import { Injectable, Logger } from '@nestjs/common';
import { WaitlistCustomer } from './entities/waitlist_customer.entity';
import { WaitlistShopper } from './entities/waitlist_shopper';
import { WaitlistBusiness } from './entities/waitlist_business';
import { AddressService } from '../address/address.service';
import { WaitlistCustomerDto } from './dto/waitlist_customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, TypeORMError } from 'typeorm';
import { WaitlistBusinessDto } from './dto/waitlist_business.dto';
@Injectable()
export class WaitlistService {
  private readonly logger = new Logger(WaitlistService.name);
  constructor(
    @InjectRepository(WaitlistCustomer)
    private customerRespository: Repository<WaitlistCustomer>,
    @InjectRepository(WaitlistShopper)
    private shopperRespository: Repository<WaitlistShopper>,
    @InjectRepository(WaitlistBusiness)
    private businessRespository: Repository<WaitlistBusiness>,
    private address: AddressService,
  ) {
    this.address = address;
  }

  async joinBusinessWaitlist(waitlistBusiness: WaitlistBusinessDto) {
    const businessExists = await this.businessRespository
      .createQueryBuilder('waitlist_business')
      .where('waitlist_business.email = :email', {
        email: waitlistBusiness.email,
      })
      .orWhere('waitlist_business.mobile = :mobile', {
        mobile: waitlistBusiness.mobile,
      })
      .getOne();

    if (businessExists) {
      throw new Error('Business already exists');
    }

    const addressId: string = await this.address.addAddress(
      waitlistBusiness.address,
    );
    waitlistBusiness.address.id = addressId;

    this.businessRespository.create(waitlistBusiness).save();
  }

  async joinShopperWaitlist(waitlistShopper: WaitlistShopper) {
    const shopperExists = await this.shopperRespository
      .createQueryBuilder('waitlist_shopper')
      .where('waitlist_shopper.email = :email', {
        email: waitlistShopper.email,
      })
      .orWhere('waitlist_shopper.mobile = :mobile', {
        mobile: waitlistShopper.mobile,
      })
      .getOne();

    if (shopperExists) {
      throw new Error('Shopper already exists');
    }

    this.shopperRespository.create(waitlistShopper).save();
  }

  async joinCustomerWaitlist(body: WaitlistCustomerDto) {
    const customerExists = await this.customerRespository
      .createQueryBuilder('waitlist_customer')
      .where('waitlist_customer.email = :email', { email: body.email })
      .orWhere('waitlist_customer.mobile = :mobile', { mobile: body.mobile })
      .getOne();

    if (customerExists) {
      throw new Error('Customer already exists');
    }

    this.customerRespository.create(body).save();
  }
}
