import { UpdateCategoryDto } from './../category/dto/update-category.dto';
import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCountryDto } from './dto/create-country.dto';
import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { CountryProcessor } from './country.process';
import { CountryRepository } from './country.repository';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(private countryRepository: CountryRepository) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryRespDto> {
    try {
      const country = new Country();
      Object.assign(country, createCountryDto);
      const newCountry = await this.countryRepository.save(country);
      return newCountry;
    } catch (error) {
      this.logger.debug(error);

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('violates foreign key constraint')
      ) {
        this.logger.error(
          `Attempted to create a country with a non-existent continent: ${createCountryDto.regionId}`,
        );

        throw new ConflictException(
          `Continent with id ${createCountryDto.regionId} does not exist`,
        );
      }

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a country with a duplicate name: ${createCountryDto.name}`,
        );

        throw new ConflictException(
          `Country with name ${createCountryDto.name} already exists`,
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<CountryListRespDto> {
    try {
      const country = await this.countryRepository.find({
        select: ['name', 'id'],
        order: {
          id: 'ASC',
        },
      });
      const countryList: CountryListRespDto =
        CountryProcessor.mapEntityListToResp(country);
      return countryList;
    } catch (error) {
      throw new Error(
        `Error retrieving all country from mongo
        \nfrom findAll method in country.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async getCountryWithContinent(): Promise<Country[]> {
    return null;
  }

  async getCountryEntities(): Promise<Country[]> {
    try {
      const country = await this.countryRepository.find();
      return country;
    } catch (error) {
      throw new Error(
        `Error retrieving all country from mongo
        \nfrom findAll method in country.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: number) {
    try {
      const country = await this.countryRepository.findOneBy({ id });
      if (!country) throw new Error('Region not found');

      const countryRespDto: CountryRespDto =
        CountryProcessor.mapEntityToResp(country);

      return countryRespDto;
    } catch (error) {
      this.logger.debug(error);
      throw error;
    }
  }

  async findOneByName(name: string) {
    try {
      const country = await this.countryRepository.findOneBy({ name });
      if (!country) throw new Error('Region not found');
      return country;
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    try {
      const region = await this.countryRepository.findOneBy({ id });
      if (!region) throw new Error('Region not found');
      const updatedRegion = await this.countryRepository.save({
        ...region,
        ...updateCategoryDto,
      });
      return updatedRegion;
    } catch (error) {
      throw error;
    }
  }

  async findBusinessByCountry(country: string): Promise<any> {
    const businesses = await this.countryRepository.findOne({
      where: { name: country },
      relations: ['countries'],
    });
    return businesses;
  }

  // TODO: finish region, country continent mapping
  // async findAllWithRegion(): Promise<any> {
  //   try {
  //     const countries =
  //       await this.countryRepository.getAllCountriesWithRegionWithContinent();

  //     if (!countries) throw new NotFoundException('No countries found');

  //     const respList: CountryRegionContinentListRespDto =
  //       CountryRegionContinentProcessor.mapEntityListToResp(
  //         countries.map((country) => {
  //           return CountryRegionContinentProcessor.mapEntityToResp(
  //             country,
  //             country.regionId,
  //             country.regionId.continentId,
  //           );
  //         }),
  //       );
  //     return respList;
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving all country from mongo
  //       \nfrom findAll method in country.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
