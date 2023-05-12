import { Injectable } from '@nestjs/common';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Business, BusinessDocument } from './entities/business.entity';
import { Model } from 'mongoose';
import { CategoryService } from '../category/category.service';
import { CountryService } from '../country/country.service';
import { ContinentService } from '../continent/continent.service';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name)
    protected businessModel: Model<BusinessDocument> & any,
    private readonly categoryService: CategoryService,
    private readonly countryService: CountryService,
    private readonly continentService: ContinentService,
  ) {}

  async create(createBusinessDto: CreateBusinessDto): Promise<any> {
    try {
      let business = new this.businessModel({ ...createBusinessDto });
      business = await business.save();
      return business;
    } catch (error) {
      throw new Error(
        'Error adding new business in create methid in business.service.ts file' +
          '\n' +
          `error message: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const businesses = await this.businessModel.find().exec();
      return businesses;
    } catch (error) {
      throw new Error(
        `Error retrieving all businesses from mongo 
        \nfrom findAll method in business.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const business = await this.businessModel.findById(id).exec();
      // throw error if business does not exist
      if (!business) {
        throw new Error(`business with id ${id} not found`);
      }

      if (business.deleted) {
        throw new Error(`business with id ${id} has been deleted`);
      }

      return business;
    } catch (error) {
      throw new Error(
        `Error getting business information for business with id ${id}, 
        \nfrom findOne method in business.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateBusinessDto: UpdateBusinessDto,
  ): Promise<void> {
    try {
      await this.businessModel.updateOne({
        _id: id,
        ...updateBusinessDto,
      });
    } catch (error) {
      throw new Error(
        `Error update business information for business with id ${id}, 
        \nfrom update method in business.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const business = await this.businessModel
        .findById(id, { deleted: 'true' })
        .exec();

      if (!business) {
        throw new Error(
          `Mongoose error with deleting business with business id ${id} 
          In remove method business.service.ts with dev error message: business with id:${id} not found`,
        );
      }

      return business;
    } catch (error) {
      throw new Error(
        `Error from remove method in business.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Find business by name
   * @param name
   * @returns
   */
  async findBusinessByName(name: string): Promise<any> {
    try {
      const business = await this.businessModel.find({ name }).exec();
      return business;
    } catch (error) {
      throw new Error(
        `Error from findBusinessByName method in business.service.ts. 
          \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Find all businesses with this category name
   * @returns {*} - businesses belonging to this category
   */
  async findByCategory(categoryName: string): Promise<any> {
    try {
      // get businesses with this category name
      const business = await this.businessModel
        .find({ 'category.name': categoryName })
        .exec();

      return business;
    } catch (error) {
      throw new Error(
        `Error from findByCategory method in business.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Find all businesses with this country name
   * @param countryName
   * @returns {*} - businesses belonging to this country
   */
  async findByCountry(countryName: string): Promise<any> {
    try {
      // get businesses with this country name
      const business = await this.businessModel
        .find({ 'country.name': countryName })
        .exec();

      return business;
    } catch (error) {
      throw new Error(`Error from findByCountry method in business.service.ts. 
      \nWith error message: ${error.message}`);
    }
  }

  /**
   * Find all businesses with this continent name
   * @param continentName
   * @returns {*} - businesses belonging to this continent
   */
  async findByContinent(continentName: string): Promise<any> {
    try {
      // get businesses with this continent name
      const business = await this.businessModel
        .find({ 'continent.name': continentName })
        .exec();

      return business;
    } catch (error) {
      throw new Error(
        `Error from findByCategory method in business.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }
}
