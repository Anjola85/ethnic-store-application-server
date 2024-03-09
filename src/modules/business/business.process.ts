import { CreateBusinessDto } from './dto/create-business.dto';
import {
  BusinessListRespDto,
  BusinessRespDto,
} from 'src/contract/version1/response/business-response.dto';
import { AddressProcessor } from '../address/address.processor';
import { CountryProcessor } from '../country/country.process';
import { MobileProcessor } from '../mobile/mobile.processor';
import { RegionProcessor } from '../region/region.process';

import { Business } from './entities/business.entity';
import { Logger } from '@nestjs/common';

export class BusinessProcessor {
  private static logger = new Logger(BusinessProcessor.name);
  public static mapEntityToResp(business: Business): BusinessRespDto {
    if (!business) return;
    try {
      const resp: BusinessRespDto = {
        id: business.id,
        name: business.name,
        description: business.description || '',
        address: AddressProcessor.mapEntityToResp(business.address),
        email: business.email || '',
        mobile: MobileProcessor.mapEntityToResp(business.mobile),
        schedule: business.schedule,
        website: business.website || '',
        countries: CountryProcessor.mapEntityListToResp(business.countries),
        regions: RegionProcessor.mapEntityListToResp(business.regions),
        businessType: business.businessType,
        rating: business.rating,
        backgroundImage: business.backgroundImage || '',
        profileImage: business.profileImage || '',
        createdAt: business.createdAt,
      };
      return resp;
    } catch (error) {
      this.logger.error(`Error mapping business entity to response: ${error}`);
      // throw new Error(
      //   'Error mapping business entity to response with error: ' +
      //     error.message,
      // );
    }
  }

  /**
   * This method maps a list of business entities to a list of business response dto
   * @param businesses
   * @returns
   */
  public static mapEntityListToResp(
    businesses: Business[],
  ): BusinessListRespDto {
    // if (!businesses || businesses.length === 0)
    //   return { size: 0, businessList: [] };

    const businessList: BusinessRespDto[] = businesses
      .map((business) => BusinessProcessor.mapEntityToResp(business))
      .filter(
        (businessResp) => businessResp !== null && businessResp !== undefined,
      );

    const payload: BusinessListRespDto = {
      size: businessList.length,
      businessList: businessList,
    };

    return payload;
  }

  /**
   * Maps CreateBusinessDto to Business entity
   * NOTE: does not map the relations properties or images
   *  EXCLUDED RELATIONS - mobile, address
   * @param businessDto
   * @returns - Business entity
   */
  public static mapCreateBusinessDtoToEntity(
    businessDto: CreateBusinessDto,
  ): Business {
    const businessEntity: Business = new Business();
    businessEntity.owner = businessDto?.owner;
    businessEntity.name = businessDto.name;
    businessEntity.description = businessDto.description;
    businessEntity.email = businessDto.email;
    businessEntity.website = businessDto.website;
    businessEntity.rating = businessDto.rating;
    businessEntity.businessType = businessDto.businessType;
    businessEntity.schedule = businessDto.schedule;
    businessEntity.countries = businessDto.countries;
    businessEntity.regions = businessDto.regions;
    return businessEntity;
  }
}
