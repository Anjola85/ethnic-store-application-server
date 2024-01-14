import { Injectable } from '@nestjs/common';
import { MobileRepository } from './mobile.repository';

@Injectable()
export class MobileService {
  constructor(private readonly mobileRespository: MobileRepository) {}

  /**
   * Adds mobile for customer or business
   * @param mobile
   * @param params - id, authId/auth or businessId/business
   * @returns
   */
  async addMobile(mobile: any, params: any) {
    return this.mobileRespository.addMobile(mobile, params);
  }

  /**
   * Gets mobile for customer or business
   * @param params
   * @returns
   */
  async getMobile(params: any) {
    return this.mobileRespository.getMobile(params);
  }

  /**
   * Updates mobile for customer or business
   * @param mobile
   * @param params
   * @returns
   */
  async updateMobile(mobile: any, params: any) {
    return this.mobileRespository.updateMobile(mobile, params);
  }

  /**
   * Deletes mobile for customer or business
   * @param params
   * @returns
   */
  async deleteMobile(params: any) {
    return this.mobileRespository.deleteMobile(params);
  }
}
