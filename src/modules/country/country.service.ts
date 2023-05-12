import { Injectable } from '@nestjs/common';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Country, CountryDocument } from './entities/country.entity';
import { Model } from 'mongoose';

@Injectable()
export class CountryService {
  constructor(
    @InjectModel(Country.name)
    protected countryModel: Model<CountryDocument> & any,
  ) {}

  async create(createCountryDto: CreateCountryDto): Promise<any> {
    try {
      let country = new this.countryModel({ ...createCountryDto });
      country = await country.save();
      return country;
    } catch (error) {
      throw new Error(
        'Error adding new country in create methid in country.service.ts file' +
          '\n' +
          `error message: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const categories = await this.countryModel.find().exec();
      return categories;
    } catch (error) {
      throw new Error(
        `Error retrieving all categories from mongo 
        \nfrom findAll method in country.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const country = await this.countryModel.findById(id).exec();
      // throw error if country does not exist
      if (!country) {
        throw new Error(`country with id ${id} not found`);
      }

      if (country.deleted) {
        throw new Error(`country with id ${id} has been deleted`);
      }

      return country;
    } catch (error) {
      throw new Error(
        `Error getting country information for country with id ${id}, 
        \nfrom findOne method in country.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(id: string, updateCountryDto: UpdateCountryDto): Promise<void> {
    try {
      await this.countryModel.updateOne({
        _id: id,
        ...updateCountryDto,
      });
    } catch (error) {
      throw new Error(
        `Error update country information for country with id ${id}, 
        \nfrom update method in country.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const country = await this.countryModel
        .findById(id, { deleted: 'true' })
        .exec();

      if (!country) {
        throw new Error(
          `Mongoose error with deleting country with country id ${id} 
          In remove method country.service.ts with dev error message: country with id:${id} not found`,
        );
      }

      return country;
    } catch (error) {
      throw new Error(
        `Error from remove method in country.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Helper methods
   */
  async findCountryByName(name: string): Promise<any> {
    try {
      const country = await this.countryModel.find({ name }).exec();
      return country;
    } catch (error) {
      throw new Error(
        `Error from findCountryByName method in country.service.ts. 
          \nWith error message: ${error.message}`,
      );
    }
  }
}
