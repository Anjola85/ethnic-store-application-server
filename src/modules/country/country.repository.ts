import { DataSource, Repository } from 'typeorm';
import { Country } from './entities/country.entity';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

@Injectable()
export class CountryRepository extends Repository<Country> {
  private readonly logger = new Logger(CountryRepository.name);

  constructor(private dataSource: DataSource) {
    super(Country, dataSource.createEntityManager());
  }

  async getAllCountriesWithRegionWithContinent(): Promise<any> {
    this.logger.debug('getAllCountriesWithRegionWithContinent called');

    try {
      const countries = await this.createQueryBuilder('country')
        .leftJoinAndSelect('country.regionId', 'region')
        .leftJoinAndSelect('region.continentId', 'continent')
        .getMany();

      return countries;
    } catch (error) {
      this.logger.error(
        `Error thrown in country.repository.ts, getAllCountriesWithRegionWithContinent method: ${error.message}`,
      );
      throw error;
    }
  }
}
