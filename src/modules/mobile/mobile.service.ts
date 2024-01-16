import { ConflictException, Injectable } from '@nestjs/common';
import { MobileRepository } from './mobile.repository';
import { Mobile, MobileParams } from './mobile.entity';
import { Auth } from '../auth/entities/auth.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

@Injectable()
export class MobileService {
  constructor(private readonly mobileRepository: MobileRepository) {}

  /**
   * TODO: rename to addBusinessMobile
   * Adds mobile for customer or business
   * @param mobile
   * @param params - auth, business or mobileDto
   * @returns
   */
  async addMobile(mobile: Mobile, isUser?: boolean): Promise<Mobile> {
    if (isUser) {
      mobile.isPrimary = true;
    }

    const params: MobileParams = {
      mobile,
    };
    const mobileExists = await this.mobileRepository.getMobile(mobile);

    if (mobileExists) {
      throw new ConflictException('Mobile already exists');
    }
    const newMobile = await this.mobileRepository.create(mobile);
    return newMobile[0];
  }

  /**
   * Adds mobile for customer and sets the mobile as primary
   * @param mobile
   * @param auth
   * @returns
   */
  async addUserMobile(mobile: Mobile, auth: Auth): Promise<Mobile> {
    mobile.isPrimary = true;
    const mobileDto: MobileDto = {
      phoneNumber: mobile.phoneNumber,
      countryCode: mobile.countryCode,
      isoType: mobile.isoType,
    };

    // const params: MobileParams = {
    //   mobile: mobileDto,
    //   auth,
    // };

    const mobileExists = await this.mobileRepository.getMobile(mobile);

    if (mobileExists) throw new ConflictException('Mobile already exists');

    // add new mobile

    // mobile.auth = auth;

    const newMobile = await this.mobileRepository.create(mobile).save();

    // // set auth
    // newMobile[0].auth = auth;

    return newMobile;
  }

  /**
   * Gets mobile for customer or business
   * @param params
   * @returns
   */
  async getMobileList(params: any): Promise<Mobile[]> {
    return await this.mobileRepository.getMobileArr(params);
  }

  async getMobile(mobile: Mobile): Promise<Mobile> {
    return await this.mobileRepository.getMobile(mobile);
  }

  /**
   * Updates mobile for customer or business
   * @param mobile
   * @param params
   * @returns
   */
  async updateMobile(mobile: Mobile, params: MobileParams) {
    return this.mobileRepository.updateMobile(mobile, params);
  }

  /**
   * Deletes mobile for customer or business
   * @param params
   * @returns
   */
  async deleteMobile(params: any) {
    return this.mobileRepository.deleteMobile(params);
  }
}
