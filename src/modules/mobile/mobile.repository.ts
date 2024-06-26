import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Mobile, MobileParams } from './mobile.entity';
import { Auth } from '../auth/entities/auth.entity';
import { Business } from '../business/entities/business.entity';
import { MobileDto } from 'src/common/dto/mobile.dto';

@Injectable()
export class MobileRepository extends Repository<Mobile> {
  private readonly logger = new Logger(MobileRepository.name);

  constructor(private dataSource: DataSource) {
    super(Mobile, dataSource.createEntityManager());
  }

  /**
   * Adds mobile for customer
   */
  async addMobile(mobile: Mobile, params: MobileParams) {
    if (params.business && typeof params.business != 'number')
      mobile.business = params.business;
    else if (params.auth && typeof params.auth != 'number') {
      // set mobile as primary
      mobile.isPrimary = true;
      // initialize auth
      mobile.auth = params.auth;
    } else {
      throw new Error(
        'Must specify if mobile is for business or user before adding to DB',
      );
    }

    // add mobile
    try {
      const newMobile = await this.createQueryBuilder('mobile')
        .insert()
        .into(Mobile)
        .values(mobile)
        .execute();
      return newMobile;
    } catch (error) {
      this.logger.error(
        `Error thrown in addMobile method in  mobilee.repository.ts, with error message: ${error.message}`,
      );
      // TODO: test and make sure this error bubbles up
      throw new Error('Unable to add mobile to  database');
    }
  }

  /**
   * Gets mobile using the phone number
   * @param params business id, auth id or mobile
   * @returns - Mobile object with auth
   */
  async getMobile(mobile: Mobile): Promise<Mobile> {
    try {
      const mobileEntity = await this.createQueryBuilder('mobile')
        .where('mobile.phone_number = :phoneNumber', {
          phoneNumber: mobile.phoneNumber,
        })
        .andWhere('mobile.country_code = :countryCode', {
          countryCode: mobile.countryCode,
        })
        .andWhere('mobile.iso_type = :isoType', {
          isoType: mobile.isoType,
        })
        .leftJoinAndSelect('mobile.auth', 'auth')
        .leftJoinAndSelect('auth.user', 'user')
        .getOne();
      return mobileEntity;
    } catch (error) {
      this.logger.error(
        `Error thrown in mobile.repository.ts, getMobile method: ${error.message}`,
      );
      throw new Error('Unable to retrieve mobile from the database');
    }
  }

  async getMobileArr(params: MobileParams): Promise<Mobile[]> {
    try {
      if (
        (params.auth && typeof params.auth == 'string') ||
        (params.business && typeof params.business == 'string') ||
        params.mobile
      ) {
        // grab auth using either business or authId
        let mobileArray;

        if (params.mobile) {
          // retrieve record by mobile object
          mobileArray = await this.createQueryBuilder('mobile')
            .where('mobile.phone_number = :phoneNumber', {
              phoneNumber: params.mobile.phoneNumber,
            })
            .andWhere('mobile.country_code = :countryCode', {
              countryCode: params.mobile.countryCode,
            })
            .andWhere('mobile.iso_type = :isoType', {
              isoType: params.mobile.isoType,
            })
            .getOne();
        } else {
          // get by auth id or business id
          mobileArray = await this.createQueryBuilder('mobile')
            .where('mobile.id = :id', { id: params.mobile })
            .orWhere('mobile.auth.id = :id', { id: params.auth })
            .orWhere('mobile.business.id = :id', { id: params.business })
            .getMany();
        }

        return mobileArray ? mobileArray : [];
      }
    } catch (error) {
      this.logger.error(
        `Error thrown in mobile.repository.ts, getMobile method: ${error.message}`,
      );
      throw new Error('Unable to retrieve mobile from the database');
    }
  }

  /**
   * Updates existing mobile with mobile id
   *
   * Precondition: mobileDto must have an id
   *
   * @param mobile - new mobile data to update to
   * @param params - auth, business or mobileDto
   * @returns
   */
  async updateMobile(mobileDto: MobileDto): Promise<Mobile> {
    try {
      if (!mobileDto && !mobileDto.id) {
        throw new Error('Mobile id is required');
      }

      const mobileToUpdate = await this.findOneBy({ id: mobileDto.id });

      if (!mobileToUpdate) {
        throw new Error('Mobile does not exist');
      }

      // mobileToUpdate.phoneNumber = mobileDto.phoneNumber;
      // mobileToUpdate.countryCode = mobileDto.countryCode;
      // mobileToUpdate.isoType = mobileDto.isoType;
      // mobileToUpdate.isPrimary = mobileDto.isPrimary;

      Object.assign(mobileToUpdate, mobileDto);

      await mobileToUpdate.save();

      return mobileToUpdate;
    } catch (error) {
      this.logger.error(
        `Error thrown in mobile.repository.ts, updateMobile method: ${error.message}`,
      );
      throw new Error('Unable to update mobile in the database');
    }
  }

  /**
   * Admin function to delete mobile
   * @param params
   */
  async deleteMobile(params: MobileParams) {
    try {
      // find the mobile to delete
      if (
        (params.auth && typeof params.auth == 'string') ||
        (params.business && typeof params.business == 'string') ||
        (params.mobile && typeof params.mobile == 'string')
      ) {
        // grab mobile using either business or authId or mobileId
        const existingMobile = await this.createQueryBuilder('mobile')
          .where('mobile.id = :id', { id: params.mobile })
          .orWhere('mobile.auth.id = :id', { id: params.auth })
          .orWhere('mobile.business.id = :id', { id: params.business })
          .getOne();

        // delete mobile
        return existingMobile.remove();
      }
    } catch (error) {}
  }

  async getMobileByAuth(auth: Auth): Promise<Mobile> {
    try {
      const authId = auth.id;
      const mobile = await this.createQueryBuilder('mobile')
        .where('mobile.auth_id = :authId', { authId })
        .getOne();
      return mobile;
    } catch (error) {
      this.logger.error(
        `Error thrown in mobile.repository.ts, getMobileByAuth method: ${error.message}`,
      );
      throw new Error('Unable to retrieve mobile from the database');
    }
  }

  async deleteMobileByAuthId(authId: any, manager: EntityManager) {
    try {
      // use the manager to delete
      await manager
        .createQueryBuilder()
        .delete()
        .from(Mobile)
        .where('auth_id = :authId', { authId })
        .execute();
    } catch (error) {
      this.logger.error(
        `Error thrown in mobile.repository.ts, deleteMobileByUserId method: ${error.message}`,
      );
      throw new Error('Unable to delete mobile from the database');
    }
  }
}
