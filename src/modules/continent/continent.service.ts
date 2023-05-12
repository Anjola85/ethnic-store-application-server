import { Injectable } from '@nestjs/common';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Continent, ContinentDocument } from './entities/continent.entity';
import { Model } from 'mongoose';

@Injectable()
export class ContinentService {
  constructor(
    @InjectModel(Continent.name)
    protected continentModel: Model<ContinentDocument> & any,
  ) {}

  async create(createContinentDto: CreateContinentDto): Promise<any> {
    try {
      let continent = new this.continentModel({ ...createContinentDto });
      continent = await continent.save();
      return continent;
    } catch (error) {
      throw new Error(
        'Error adding new continent in create methid in continent.service.ts file' +
          '\n' +
          `error message: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const categories = await this.continentModel.find().exec();
      return categories;
    } catch (error) {
      throw new Error(
        `Error retrieving all categories from mongo 
        \nfrom findAll method in continent.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const continent = await this.continentModel.findById(id).exec();
      // throw error if continent does not exist
      if (!continent) {
        throw new Error(`continent with id ${id} not found`);
      }

      if (continent.deleted) {
        throw new Error(`continent with id ${id} has been deleted`);
      }

      return continent;
    } catch (error) {
      throw new Error(
        `Error getting continent information for continent with id ${id}, 
        \nfrom findOne method in continent.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateContinentDto: UpdateContinentDto,
  ): Promise<void> {
    try {
      await this.continentModel.updateOne({
        _id: id,
        ...updateContinentDto,
      });
    } catch (error) {
      throw new Error(
        `Error update continent information for continent with id ${id}, 
        \nfrom update method in continent.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const continent = await this.continentModel
        .findById(id, { deleted: 'true' })
        .exec();

      if (!continent) {
        throw new Error(
          `Mongoose error with deleting continent with continent id ${id} 
          In remove method continent.service.ts with dev error message: continent with id:${id} not found`,
        );
      }

      return continent;
    } catch (error) {
      throw new Error(
        `Error from remove method in continent.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Helper methods
   */
  async findContinentByName(name: string): Promise<any> {
    try {
      const continent = await this.continentModel.find({ name }).exec();
      return continent;
    } catch (error) {
      throw new Error(
        `Error from findContinentByName method in continent.service.ts. 
          \nWith error message: ${error.message}`,
      );
    }
  }
}
