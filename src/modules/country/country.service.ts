import { UpdateCategoryDto } from './../category/dto/update-category.dto';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Country } from './entities/country.entity';
import { CreateCountryDto } from './dto/create-country.dto';
import {
  CountryListRespDto,
  CountryRespDto,
} from 'src/contract/version1/response/country-response.dto';
import { CountryProcessor } from './country.process';
import { CountryRepository } from './country.repository';
import { CountryRegionContinentProcessor } from '../../contract/version1/response/country-region-continent.response';
import { InjectRepository } from '@nestjs/typeorm';
import { AwsS3Service } from '../files/aws-s3.service';
import { DataSource } from 'typeorm';
import { AppDataSource } from 'src/config/app-data-source';
import * as path from 'path';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(
    @InjectRepository(CountryRepository)
    private countryRepository: CountryRepository,
    private awsS3Service: AwsS3Service,
    private connection: DataSource,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<CountryRespDto> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const country = new Country();
      Object.assign(country, createCountryDto);

      const newCountry = await queryRunner.manager.save(country);
      await queryRunner.commitTransaction();

      // process response
      const countryRespDto: CountryRespDto =
        CountryProcessor.mapEntityToResp(newCountry);

      if (createCountryDto.image) {
        const extension = path.extname(createCountryDto.image.originalname);
        const imageUrl = await this.awsS3Service.uploadImgToFolder(
          `server/geographic_images/countries/${createCountryDto.name}${extension}`,
          createCountryDto.image.buffer,
        );

        // Start a new transaction to update the image URL
        await queryRunner.startTransaction();
        newCountry.imageUrl = imageUrl;

        const updatedCountry = await queryRunner.manager.save(newCountry);
        await queryRunner.commitTransaction();

        countryRespDto.imageUrl = updatedCountry.imageUrl;
      }

      return countryRespDto;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.debug(error);

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('violates foreign key constraint')
      ) {
        this.logger.error(
          `Attempted to create a country with a non-existent region: ${createCountryDto.regionId}`,
        );
        throw new ConflictException(
          `Region with id ${createCountryDto.regionId} does not exist`,
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
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<CountryListRespDto> {
    try {
      const country = await this.countryRepository.find({
        select: ['name', 'id', 'imageUrl'],
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
    return await this.countryRepository.findOne({
      where: { name: country },
      relations: ['countries'],
    });
  }

  async findAllWithRegion(): Promise<any> {
    try {
      const countries =
        await this.countryRepository.getAllCountriesWithRegionWithContinent();

      return CountryRegionContinentProcessor.mapToCountryRegionContinentInfoList(
        countries.map((country: Country) => {
          return CountryRegionContinentProcessor.mapToCountryRegionContinentInfo(
            country,
            country.regionId,
            country.regionId.continentId,
          );
        }),
      );
    } catch (error) {
      throw new Error(
        `Error retrieving all country from mongo
        \nfrom findAll method in country.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }
}
