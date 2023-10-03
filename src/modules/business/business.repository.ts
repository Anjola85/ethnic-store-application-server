import { DataSource, Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { GeoLocationDto } from './dto/geolocation.dto';

@Injectable()
export class BusinessRepository extends Repository<Business> {
  private readonly logger = new Logger(BusinessRepository.name);

  constructor(private dataSource: DataSource) {
    super(Business, dataSource.createEntityManager());
  }

  // method to create business
  async addBusiness(business: Business) {
    try {
      const newBusiness = await this.createQueryBuilder('business')
        .insert()
        .into(Business)
        .values(business)
        .execute();

      return newBusiness;
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, addBusiness method: ${error.message}`,
      );
      throw new HttpException(
        'Unable to add business to the database',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findByName(name: string): Promise<Business> {
    try {
      const business = await this.findBy({ name });

      if (typeof business === undefined) return null;

      return business[0];
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
      const { coordinates } = geolocationDto;
      const businesses = await this.createQueryBuilder('business')
        .where(
          `ST_DistanceSphere(
            business.location,
            ST_GeomFromGeoJSON(:coordinates)
          ) < 1000`,
          { coordinates: JSON.stringify({ type: 'Point', coordinates }) },
        )
        .getMany();

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
}
