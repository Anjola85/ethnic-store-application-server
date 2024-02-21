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
  async registerMobile(mobileDto: MobileDto): Promise<Mobile> {
    try {
      const mobile: Mobile = Object.assign(new Mobile(), mobileDto);

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

  /**
   * This method gets mobile by phone number
   * @param mobileParam
   * @returns - Mobile object with auth
   */
  async getMobileByPhoneNumber(
    mobileParam: Mobile | MobileDto,
  ): Promise<Mobile> {
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
   * @param MobileDto - mobile to update
   * @param params - contains ids for mobile, auth or business
   * @returns
   */
  async updateMobile(mobile: MobileDto): Promise<Mobile> {
    const mobileEntity: Mobile = await this.mobileRepository.updateMobile(
      mobile,
    );
    return mobileEntity;
  }

  /**
   * Deletes mobile for customer or business
   * @param params
   * @returns
   */
  async deleteMobile(params: any) {
    return this.mobileRepository.deleteMobile(params);
  }

  async getMobileByAuth(auth: Auth): Promise<Mobile> {
    if (!auth) throw new Error('Auth is required');
    return await this.mobileRepository.getMobileByAuth(auth);
  }
}
