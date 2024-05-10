import { DataSource, Repository } from "typeorm";
import { Business, BusinessParam } from "./entities/business.entity";
import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
import { GenericFilter } from "../common/generic-filter";

@Injectable()
export class BusinessRepository extends Repository<Business> {
  private readonly logger = new Logger(BusinessRepository.name);

  constructor(private dataSource: DataSource) {
    super(Business, dataSource.createEntityManager());
  }

  /**
   * Retrieve all businesses
   * @returns businesses - an array of businesses
   */
  async findByUniq(params: BusinessParam): Promise<{ businessExist:Business, type: string }> {
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

        businessExist = await this.createQueryBuilder('business')
          .leftJoinAndSelect('business.address', 'address')
          .leftJoinAndSelect('business.mobile', 'mobile')
          .leftJoinAndSelect('business.countries', 'countries')
          .leftJoinAndSelect('business.regions', 'regions')
          .addSelect((subQuery) => {
            return subQuery
              .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
              .from('address', 'address')
              .where('address.id = business.address_id');
          }, 'locationGeoJSON')
          .where('business.name = :name', { name })
          .getOne();
      }

      if (email) {
        type = 'email';
        businessExist = await this.createQueryBuilder('business')
          .leftJoinAndSelect('business.address', 'address')
          .leftJoinAndSelect('business.mobile', 'mobile')
          .leftJoinAndSelect('business.countries', 'countries')
          .leftJoinAndSelect('business.regions', 'regions')
          .addSelect((subQuery) => {
            return subQuery
              .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
              .from('address', 'address')
              .where('address.id = business.address_id');
          }, 'locationGeoJSON')
          .where('business.email = :email', { email })
          .getOne();
      }
      if (businessId && !type) {
        type = 'businessId';
        businessExist = await this.createQueryBuilder('business')
          .leftJoinAndSelect('business.address', 'address')
          .leftJoinAndSelect('business.mobile', 'mobile')
          .leftJoinAndSelect('business.countries', 'countries')
          .leftJoinAndSelect('business.regions', 'regions')
          .addSelect((subQuery) => {
            return subQuery
              .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
              .from('address', 'address')
              .where('address.id = business.address_id');
          }, 'locationGeoJSON')
          .where('business.id = :id', { id: businessId })
          .getOne();
      }

      if (typeof businessExist === undefined) return null;

      return { businessExist, type };
    } catch (error) {
      this.logger.error(
        `Error thrown in business.repository.ts, findByName method: ${error.message}`,
      );
      throw error;
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

      return await this.createQueryBuilder('business')
        .innerJoinAndSelect('business.countries', 'country')
        .where('country.name = :country_id', { country })
        .getMany();
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
      return null;
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

  async getAllRelation(): Promise<Business[]> {
    return await this.createQueryBuilder('business')
      .leftJoinAndSelect('business.address', 'address')
      .leftJoinAndSelect('business.mobile', 'mobile')
      .leftJoinAndSelect('business.countries', 'countries')
      .leftJoinAndSelect('business.regions', 'regions')
      .addSelect((subQuery) => {
        return subQuery
          .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
          .from('address', 'address')
          .where('address.id = business.address_id');
      }, 'locationGeoJSON')
      .orderBy('business.id', 'ASC')
      .getMany();
  }

  /**
   * This method retrieves the closest businesses to a given location
   * @param lat
   * @param lon
   * @returns
   */
  async getClosestBusinesses(lat: number, lon: number): Promise<Business[]> {
    const pointOfInterest = `SRID=4326;POINT(${lon} ${lat})`; // Create a POINT for the provided lat & lon

    return await this.createQueryBuilder('business')
      .leftJoinAndSelect('business.address', 'address')
      .leftJoinAndSelect('business.mobile', 'mobile')
      .leftJoinAndSelect('business.countries', 'countries')
      .leftJoinAndSelect('business.regions', 'regions')
      .addSelect((subQuery) => {
        return subQuery
          .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
          .from('address', 'address')
          .where('address.id = business.address_id');
      }, 'locationGeoJSON')
      .orderBy(
        `ST_Distance(address.location, ST_GeomFromText('${pointOfInterest}', 4326))`,
        'ASC',
      ) // Order by distance to the point of interest
      .getMany();
  }

  /**
   *
   * @param filter
   * @returns
   */
  async getPaginatedRelations(
    filter: GenericFilter,
  ): Promise<[Business[], number]> {
    const { page, pageSize, orderBy, sortOrder } = filter;

    const skip = (page - 1) * pageSize;

    let queryBuilder = this.createQueryBuilder('business')
      .leftJoinAndSelect('business.address', 'address')
      .leftJoinAndSelect('business.mobile', 'mobile')
      .leftJoinAndSelect('business.countries', 'countries')
      .leftJoinAndSelect('business.regions', 'regions')
      .addSelect((subQuery) => {
        return subQuery
          .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
          .from('address', 'address')
          .where('address.id = business.address_id');
      }, 'locationGeoJSON')
      .skip(skip)
      .take(pageSize);

    // Optionally, handle ordering if orderBy is provided
    if (orderBy && sortOrder) {
      queryBuilder = queryBuilder.orderBy(`business.${orderBy}`, sortOrder);
    }

    // Execute the query to get paginated results
    const [businessRelations, total] = await queryBuilder.getManyAndCount();

    return [businessRelations, total];
  }

  /**
   * Retrieve all businesses provided their ids
   * @param businesses
   * @returns
   */
  async getRelationsByBusinessId(businesses: number[]): Promise<Business[]> {
    try {
      const businessRelations = await this.createQueryBuilder('business')
        .leftJoinAndSelect('business.address', 'address')
        .leftJoinAndSelect('business.mobile', 'mobile')
        .leftJoinAndSelect('business.countries', 'countries')
        .leftJoinAndSelect('business.regions', 'regions')
        .addSelect((subQuery) => {
          return subQuery
            .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
            .from('address', 'address')
            .where('address.id = business.address_id');
        }, 'locationGeoJSON')
        .where('business.id IN (:...businesses)', { businesses })
        .getMany();

      return businessRelations;
      // const resp= await this.createQueryBuilder('business_table')
      //   .leftJoinAndSelect('business_table.address', 'address_table')
      //   .leftJoinAndSelect('business_table.mobile', 'mobile_table')
      //   .leftJoinAndSelect('business_table.countries', 'countries_table')
      //   .leftJoinAndSelect('business_table.regions', 'regions_table')
      //   .addSelect((subQuery) => {
      //     return subQuery
      //       .select('ST_AsGeoJSON(address.location)', 'locationGeoJSON')
      //       .from('address', 'a')
      //       .where('a.id = address_table.id');
      //   }, 'locationGeoJSON')
      //   .where('business_table.id IN (:...businesses)', { businesses })
      //   .getMany();
      // return resp;
    } catch (e) {
      console.log(e);
      throw e;
    }
  }

  /**
   * Retrieve business by name
   * @param name
   * @returns
   */
  async findByName(name: string): Promise<Business> {
    return await this.createQueryBuilder('business')
      .where('business.name = :name', { name })
      .getOne();
  }
}
