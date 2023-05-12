import { Injectable } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Category, CategoryDocument } from './entities/category.entity';
import { Model } from 'mongoose';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name)
    protected categoryModel: Model<CategoryDocument> & any,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    try {
      let category = new this.categoryModel({ ...createCategoryDto });
      category = await category.save();
      return category;
    } catch (error) {
      throw new Error(
        'Error adding new category in create methid in category.service.ts file' +
          '\n' +
          `error message: ${error.message}`,
      );
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryModel.find().exec();
      return categories;
    } catch (error) {
      throw new Error(
        `Error retrieving all categories from mongo 
        \nfrom findAll method in category.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(id: string): Promise<any> {
    try {
      const category = await this.categoryModel.findById(id).exec();
      // throw error if category does not exist
      if (!category) {
        throw new Error(`category with id ${id} not found`);
      }

      if (category.deleted) {
        throw new Error(`category with id ${id} has been deleted`);
      }

      return category;
    } catch (error) {
      throw new Error(
        `Error getting category information for category with id ${id}, 
        \nfrom findOne method in category.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<void> {
    try {
      await this.categoryModel.updateOne({
        _id: id,
        ...updateCategoryDto,
      });
    } catch (error) {
      throw new Error(
        `Error update category information for category with id ${id}, 
        \nfrom update method in category.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(id: string): Promise<any> {
    try {
      const category = await this.categoryModel
        .findById(id, { deleted: 'true' })
        .exec();

      if (!category) {
        throw new Error(
          `Mongoose error with deleting category with category id ${id} 
          In remove method category.service.ts with dev error message: category with id:${id} not found`,
        );
      }

      return category;
    } catch (error) {
      throw new Error(
        `Error from remove method in category.service.ts. 
        \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Retrieve category by name
   * @param name
   * @returns
   */
  async findCategoryByName(name: string): Promise<any> {
    try {
      const category = await this.categoryModel.find({ name }).exec();
      return category;
    } catch (error) {
      throw new Error(
        `Error from findCategoryByName method in category.service.ts. 
          \nWith error message: ${error.message}`,
      );
    }
  }
}
