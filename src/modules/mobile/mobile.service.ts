import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { MobileRepository } from './mobile.repository';
import { Mobile, MobileParams } from './mobile.entity';
import { Auth } from '../auth/entities/auth.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

@Injectable()
export class MobileService {
  private readonly logger = new Logger(MobileService.name);
  constructor(private readonly mobileRepository: MobileRepository) {}

  /**
   * Adds mobile for business or customer
   * @param mobile
   * @param params - auth, business or mobileDto
   * @returns
   */
  async addMobile(mobileDto: MobileDto, isUser: boolean): Promise<Mobile> {
    try {
      const mobile: Mobile = Object.assign(new Mobile(), mobileDto);
      if (isUser) mobile.isPrimary = true;
      const newMobile = await this.mobileRepository.create(mobile).save();
      return newMobile;
    } catch (error) {
      this.logger.debug('error in MobileService: ' + error);

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a mobile with a duplicate number: ${mobileDto}`,
        );

        throw new ConflictException(
          `Mobile with number ${mobileDto} already exists`,
        );
      }

      throw error;
    }
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
