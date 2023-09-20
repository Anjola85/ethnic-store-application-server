import { Injectable } from '@nestjs/common';
import { Country } from './entities/country.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCountryDto } from './dto/create-country.dto';

@Injectable()
export class CountryService {
  constructor(
    @InjectRepository(Country)
    protected countryRepository: Repository<Country>,
  ) {}

  async create(createCountryDto: CreateCountryDto) {
    const country = await this.countryRepository
      .create(createCountryDto)
      .save();
    return country;
  }
  // async findAll() {
  //   try {
  //     const categories = await this.countryModel.find().exec();
  //     return categories;
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving all categories from mongo
  //       \nfrom findAll method in country.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
  // async findOne(id: string): Promise<any> {
  //   try {
  //     const country = await this.countryModel.findById(id).exec();
  //     // throw error if country does not exist
  //     if (!country) {
  //       throw new Error(`country with id ${id} not found`);
  //     }
  //     if (country.deleted) {
  //       throw new Error(`country with id ${id} has been deleted`);
  //     }
  //     return country;
  //   } catch (error) {
  //     throw new Error(
  //       `Error getting country information for country with id ${id},
  //       \nfrom findOne method in country.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
  // async update(id: string, updateCountryDto: UpdateCountryDto): Promise<void> {
  //   try {
  //     await this.countryModel.updateOne({
  //       _id: id,
  //       ...updateCountryDto,
  //     });
  //   } catch (error) {
  //     throw new Error(
  //       `Error update country information for country with id ${id},
  //       \nfrom update method in country.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
  // async remove(id: string): Promise<any> {
  //   try {
  //     const country = await this.countryModel
  //       .findById(id, { deleted: 'true' })
  //       .exec();
  //     if (!country) {
  //       throw new Error(
  //         `Mongoose error with deleting country with country id ${id}
  //         In remove method country.service.ts with dev error message: country with id:${id} not found`,
  //       );
  //     }
  //     return country;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from remove method in country.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
  // /**
  //  * Helper methods
  //  */
  // async findCountryByName(name: string): Promise<any> {
  //   try {
  //     const country = await this.countryModel.find({ name }).exec();
  //     return country;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from findCountryByName method in country.service.ts.
  //         \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
