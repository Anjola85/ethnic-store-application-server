import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCountryDto } from './dto/create-country.dto';
import { ContinentParams } from '../continent/entities/continent.entity';

@Injectable()
export class CountryService {
  private readonly logger = new Logger(CountryService.name);

  constructor(
    @InjectRepository(Country)
    protected countryRepository: Repository<Country>,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<any> {
    try {
      const countryExist = await this.countryRepository
        .createQueryBuilder('continent')
        .where('continent.name = :name', { name: createCountryDto.name })
        .getOne();

      if (countryExist) {
        this.logger.log(`Databse returned continentExist: ${countryExist}`);

        throw new ConflictException(
          `Continent with name ${createCountryDto.name} already exists`,
        );
      }

      const country = new Country();
      country.name = createCountryDto.name;
      const newCountry = await this.countryRepository.save(country);
      return newCountry;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const country = await this.countryRepository.find({
        select: ['name'],
      });
      return country;
    } catch (error) {
      throw new Error(
        `Error retrieving all country from mongo
        \nfrom findAll method in country.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  // async findOne(params: CategoryParams): Promise<any> {
  //   try {
  //     const category = await this.categoryRepository
  //       .createQueryBuilder('category')
  //       .where('category.id = :id', { id: params.id })
  //       .orWhere('category.name = :name', { name: params.name })
  //       .getOne();

  //     if (!category) {
  //       if (params.id)
  //         throw new NotFoundException(`category with  ${params} not found`);
  //       else if (params.name)
  //         throw new NotFoundException(`category with  ${params} not found`);
  //     }

  //     if (category.deleted)
  //       throw new NotFoundException(`category with ${params} has been deleted`);

  //     return category;
  //   } catch (error) {
  //     throw new Error(
  //       `Error getting category information for category ${params},
  //       \nfrom findOne method in category.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
  //   try {
  //     const cateogryResp = await this.categoryRepository
  //       .createQueryBuilder('category')
  //       .where('category.id = :id', { id })
  //       .getOne();

  //     if (!cateogryResp)
  //       throw new NotFoundException(`category with id ${id} not found`);

  //     cateogryResp.name = updateCategoryDto.name;
  //     const updatedCategory = await this.categoryRepository.save(cateogryResp);

  //     return updatedCategory;
  //   } catch (error) {
  //     throw new Error(
  //       `Error update category information for category with id ${id},
  //       \nfrom update method in category.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // async remove(params: CategoryParams): Promise<boolean> {
  //   try {
  //     const category = await this.findOne(params);
  //     category.deleted = true;
  //     await this.categoryRepository.save(category);

  //     return true;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from remove method in category.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
