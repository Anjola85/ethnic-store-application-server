import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  Res,
  HttpException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Response } from 'express';
import { createResponse } from 'src/common/util/response';

@Controller('category')
export class CategoryController {
  private readonly logger = new Logger(CategoryController.name);
  constructor(private readonly categoryService: CategoryService) {}
  @Post('register')
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<any> {
    try {
      const resp = await this.categoryService.create(createCategoryDto);

      return createResponse('Category registered successfully', resp);
    } catch (error) {
      this.logger.debug(error);

      if (error instanceof ConflictException) {
        throw new HttpException(error.message, HttpStatus.CONFLICT);
      }

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll(): Promise<any> {
    try {
      const category = await this.categoryService.findAll();
      return createResponse('List of categories', {
        result: category,
        size: category.length,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // @Get(':id')
  // async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
  //   try {
  //     const category = await this.categoryService.findOne(id);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'user information fetched',
  //       category,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to retrieve category information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateCategoryDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     await this.categoryService.update(id, updateUserDto);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'category information updated',
  //       category: updateUserDto.name,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to update category information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.categoryService.remove(id);
  // }
  // /**
  //  * Get category ID by name
  //  * @param name
  //  * @param res
  //  * @returns
  //  */
  // @Get('get-id/:name')
  // async getCategoryIdByName(
  //   @Param('name') name: string,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const category = await this.categoryService.findCategoryByName(name);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'category information fetched',
  //       id: category._id,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to retrieve category information',
  //       error: err.message,
  //     });
  //   }
  // }
}
