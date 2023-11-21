import { Injectable, Logger } from '@nestjs/common';
import { WaitlistCustomer } from './entities/waitlist_customer.entity';
import { WaitlistShopper } from './entities/waitlist_shopper';
import { WaitlistBusiness } from './entities/waitlist_business';
import { AddressService } from '../address/address.service';
import { WaitlistCustomerDto } from './dto/waitlist_customer.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WaitlistBusinessDto } from './dto/waitlist_business.dto';
import { WaitlistShopperDto } from './dto/waitlist_shopper.dto';
import axios from 'axios';
import { AddressDto } from '../address/dto/address.dto';
import { SendgridService } from 'src/providers/otp/sendgrid/sendgrid.service';
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
    private readonly sendgridService: SendgridService,
  ) {
    this.address = address;
  }

  async joinBusinessWaitlist(waitlistBusiness: WaitlistBusinessDto) {
    try {
      const businessExists = await this.businessRespository
        .createQueryBuilder('waitlist_business')
        .where('waitlist_business.email = :email', {
          email: waitlistBusiness.email,
        })
        .orWhere('waitlist_business.mobile = :mobile', {
          mobile: waitlistBusiness.mobile,
        })
        .orWhere('waitlist_business.name = :name', {
          name: waitlistBusiness.name,
        })
        .getOne();

      if (businessExists) {
        throw new Error('Business already exists');
      } else {
        // call waitlist thrid-party service
        const waitlist_uuid = await this.sendToWaitlistService(
          waitlistBusiness,
        );
        waitlistBusiness.waitlist_uuid = waitlist_uuid;

        this.businessRespository.create(waitlistBusiness).save();
        this.sendgridService.businessWelcomeEmail(
          waitlistBusiness.email,
          waitlistBusiness.name,
        );
      }
    } catch (error) {
      return;
    }
  }

  async joinShopperWaitlist(waitlistShopper: WaitlistShopperDto) {
    try {
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
      } else {
        // call waitlist thrid-party service
        const waitlist_uuid = await this.sendToWaitlistService(waitlistShopper);
        waitlistShopper.waitlist_uuid = waitlist_uuid;

        this.shopperRespository.create(waitlistShopper).save();
        this.sendgridService.shopperWelcomeEmail(
          waitlistShopper.email,
          waitlistShopper.firstName,
        );
      }
    } catch (error) {
      return;
    }
  }

  async joinCustomerWaitlist(body: WaitlistCustomerDto) {
    try {
      const customerExists = await this.customerRespository
        .createQueryBuilder('waitlist_customer')
        .where('waitlist_customer.email = :email', { email: body.email })
        .orWhere('waitlist_customer.mobile = :mobile', { mobile: body.mobile })
        .getOne();

      if (customerExists) {
        throw new Error('Customer already exists');
      } else {
        // call waitlist thrid-party service
        const waitlist_uuid = await this.sendToWaitlistService(body);
        body.waitlist_uuid = waitlist_uuid;

        this.customerRespository.create(body).save();

        this.sendgridService.customerWelcomeEmail(body.email, body.firstName);
      }
    } catch (error) {
      return;
    }
  }

  async sendToWaitlistService(payload: any) {
    const data = this.extractData(payload);

    try {
      const response = await axios.post(
        'https://api.getwaitlist.com/api/v1/signup',
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      return response.data.uuid;
    } catch (error) {
      this.logger.error(
        'Error in sendToWaitlistService third-party, with error: ' +
          error +
          ' and error message: ' +
          error.message,
      );
      throw new Error('Error in sendToWaitlistService');
    }
  }

  private extractData(payload: any) {
    let data;

    if (payload instanceof WaitlistCustomerDto)
      data = this.extractCustomerData(data, payload);
    else if (payload instanceof WaitlistShopperDto)
      data = this.extractShopperData(data, payload);
    else if (payload instanceof WaitlistBusinessDto)
      data = this.extractBusinessData(data, payload);
    else throw new Error('Invalid payload');

    return data;
  }

  private extractBusinessData(data: any, payload: any) {
    // const addrStr = this.stringifyAddress(payload.address);
    data = {
      waitlist_id: Number(process.env.WAITLIST_ID),
      phone: `${payload.mobile.countryCode}${payload.mobile.phoneNumber}`,
      email: payload.email,
      answers: [
        {
          question_value: 'address',
          optional: false,
          answer_value: payload.address,
        },
        {
          question_value: 'businessType',
          optional: false,
          answer_value: payload.businessType,
        },
        {
          question_value: 'name',
          optional: false,
          answer_value: payload.name,
        },
        {
          question_value: 'country',
          optional: false,
          answer_value: payload.countryEthnicity,
        },
        {
          question_value: 'userType',
          optional: false,
          answer_value: 'business',
        },
      ],
    };
    return data;
  }

  private extractShopperData(data: any, payload: any) {
    data = {
      waitlist_id: Number(process.env.WAITLIST_ID),
      phone: `${payload.mobile.countryCode}${payload.mobile.phoneNumber}`,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      answers: [
        {
          question_value: 'zipcode',
          optional: false,
          answer_value: payload.zipCode,
        },
        {
          question_value: 'country',
          optional: false,
          answer_value: payload.country,
        },
        {
          question_value: 'age',
          optional: false,
          answer_value: payload.age,
        },
        {
          question_value: 'userType',
          optional: false,
          answer_value: 'shopper',
        },
      ],
    };
    return data;
  }

  private extractCustomerData(data: any, payload: any) {
    data = {
      waitlist_id: Number(process.env.WAITLIST_ID),
      phone: `${payload.mobile.countryCode}${payload.mobile.phoneNumber}`,
      first_name: payload.firstName,
      last_name: payload.lastName,
      email: payload.email,
      answers: [
        {
          question_value: 'zipcode',
          optional: false,
          answer_value: payload.zipCode,
        },
        {
          question_value: 'country',
          optional: false,
          answer_value: payload.country,
        },
        {
          question_value: 'promotions',
          optional: false,
          answer_value: String(payload.promotions),
        },
        {
          question_value: 'userType',
          optional: false,
          answer_value: 'customer',
        },
      ],
    };
    return data;
  }

  private stringifyAddress(address: AddressDto) {
    return `${address.unit} ${address.street}, ${address.city}, ${address.province}, ${address.postalCode}, ${address.country}`;
  }
}
