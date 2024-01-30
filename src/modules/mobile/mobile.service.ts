import { ConflictException, Injectable } from '@nestjs/common';
import { MobileRepository } from './mobile.repository';
import { Mobile, MobileParams } from './mobile.entity';
import { Auth } from '../auth/entities/auth.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

@Injectable()
export class MobileService {
  constructor(private readonly mobileRepository: MobileRepository) {}

  /**
   * Adds mobile for business or customer
   * @param mobile
   * @param params - auth, business or mobileDto
   * @returns
   */
  async addMobile(mobileDto: MobileDto, isUser: boolean): Promise<Mobile> {
    const mobile: Mobile = Object.assign(new Mobile(), mobileDto);

    if (isUser) mobile.isPrimary = true;

    const mobileExists = await this.mobileRepository.getMobile(mobile);

    if (mobileExists) throw new ConflictException('Mobile already exists');

    const newMobile = await this.mobileRepository.create(mobile).save();

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

  async getMobile(mobileParam: Mobile | MobileDto): Promise<Mobile> {
    let mobile: Mobile;
    if (mobileParam instanceof MobileDto) {
      mobile = new Mobile();
      Object.assign(mobile, mobileParam);
    } else {
      mobile = mobileParam;
    }
    const mobileResp = await this.mobileRepository.getMobile(mobile);
    return mobileResp;
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
