import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Category,
  CategoryDocument,
  CategoryParams,
} from './entities/category.entity';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class CategoryService {
  private readonly logger = new Logger(CategoryService.name);
  constructor(
    @InjectRepository(Category)
    protected categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto): Promise<any> {
    try {
      // check if category already exists
      const categoryExists = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.name = :name', { name: createCategoryDto.name })
        .getOne();

      if (categoryExists) {
        this.logger.log(`Databse returned categoryExists: ${categoryExists}`);
        throw new ConflictException(
          `Category with name ${createCategoryDto.name} already exists`,
        );
      }

      const category = new Category();
      category.name = createCategoryDto.name;
      const newCategory = await this.categoryRepository.save(category);
      return newCategory;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        select: ['name'],
      });
      return categories;
    } catch (error) {
      throw error;
    }
  }

  async findOne(params: CategoryParams): Promise<any> {
    try {
      const category = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.id = :id', { id: params.id })
        .orWhere('category.name = :name', { name: params.name })
        .getOne();

      if (!category) {
        if (params.id)
          throw new NotFoundException(`category with  ${params} not found`);
        else if (params.name)
          throw new NotFoundException(`category with  ${params} not found`);
      }

      if (category.deleted)
        throw new NotFoundException(`category with ${params} has been deleted`);

      return category;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<any> {
    try {
      const cateogryResp = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.id = :id', { id })
        .getOne();

      if (!cateogryResp)
        throw new NotFoundException(`category with id ${id} not found`);

      cateogryResp.name = updateCategoryDto.name;
      const updatedCategory = await this.categoryRepository.save(cateogryResp);

      return updatedCategory;
    } catch (error) {
      throw error;
    }
  }

  async remove(params: CategoryParams): Promise<boolean> {
    try {
      const category = await this.findOne(params);
      category.deleted = true;
      await this.categoryRepository.save(category);

      return true;
    } catch (error) {
      throw error;
    }
  }
}
