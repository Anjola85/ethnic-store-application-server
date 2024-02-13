import { DataSource, Repository } from 'typeorm';
import { Business, BusinessParam } from './entities/business.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeoLocationDto } from './dto/geolocation.dto';

@Injectable()
export class BusinessRepository extends Repository<Business> {
  private readonly logger = new Logger(BusinessRepository.name);

  constructor(private dataSource: DataSource) {
    super(Business, dataSource.createEntityManager());
  }

  async findByUniq(params: BusinessParam): Promise<any> {
    this.logger.debug(
      `findByUniq called with params: ${JSON.stringify(params)}`,
    );

    const { name, email, businessId } = params;

    try {
      let businessExist: Business;
      let type: string;

      if (name) {
        type = 'name';
        businessExist = await this.createQueryBuilder('business')
          .where('business.name = :name', { name })
          .getOne();
      }
      if (email && !type) {
        type = 'email';
        businessExist = await this.createQueryBuilder('business')
          .where('business.email = :email', { email })
          .getOne();
      }
      if (businessId && !type) {
        type = 'businessId';
        businessExist = await this.createQueryBuilder('business')
          .where('business.id = :id', { id: businessId })
          .getOne();
      }

      if (typeof businessExist === undefined) return null;

      return { businessExist, type };
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, findByName method: ${error.message}`,
      );
      throw new HttpException(
        `Error fetching business with name ${name}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findNearbyBusinesses(geolocationDto: GeoLocationDto) {
    try {
      this.logger.debug(
        `findNearbyBusinesses called with geolocation: ${JSON.stringify(
          geolocationDto,
        )}`,
      );
      // 1km radius
      const radius = 1000;
      const { coordinates } = geolocationDto;
      const businesses = await this.createQueryBuilder('business')
        .where(
          `ST_DistanceSphere(
            business.location,
            ST_GeomFromGeoJSON(:coordinates)
          ) < ${radius}`,
          { coordinates: JSON.stringify({ type: 'Point', coordinates }) },
        )
        .getMany();

      // log the response
      this.logger.debug(
        `findNearbyBusinesses responded with: ${JSON.stringify(businesses)}`,
      );

      return businesses;
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, findNearbyBusinesses method: ${error.message}`,
      );

      throw new HttpException(
        `Error fetching nearby businesses`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieve all businesses belonging to a country
   * @param country - country name
   * @returns businesses - an array of businesses
   */
  async findByCountry(country: string): Promise<any> {
    try {
      this.logger.debug(`findByCountry called with country: ${country}`);

      const businesses = await this.createQueryBuilder('business')
        .innerJoinAndSelect('business.countries', 'country')
        .where('country.name = :countryId', { country })
        .getMany();

      return businesses;
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, findByCountry method: ${error.message}`,
      );

      // TODO: test if error means country not found
      // check if error means country not found
      if (error.message.includes('relation "country" does not exist')) {
        throw new HttpException(
          `Country ${country} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Error fetching businesses for country ${country}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Retrieve all businesses belonging to a region
   * @parama region - region name
   * @Returns businesses - an array of businesses
   */
  async findByRegion(region: string): Promise<any> {
    try {
      this.logger.debug(`findByRegion called with region: ${region}`);

      // const businesses = await this.createQueryBuilder('business')
      //   .innerJoinAndSelect('business.regions', 'region')
      //   .where('region.name = :regionId', { region })
      //   .getMany();
      const businesses = null;

      return businesses;
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, findByRegion method: ${error.message}`,
      );

      // TODO: check if error means region not found
      // check if error means region not found
      if (error.message.includes('relation "region" does not exist')) {
        throw new HttpException(
          `Region ${region} not found`,
          HttpStatus.NOT_FOUND,
        );
      }

      throw new HttpException(
        `Error fetching businesses for region ${region}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
