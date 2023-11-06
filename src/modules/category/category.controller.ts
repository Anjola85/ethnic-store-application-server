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
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Response } from 'express';

@Controller('category')
export class CategoryController {
  // constructor(private readonly categoryService: CategoryService) {}
  // @Post('register')
  // async create(
  //   @Body() createCategoryDto: CreateCategoryDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     // check if category exists
  //     const categoryExists = await this.categoryService.findCategoryByName(
  //       createCategoryDto.name,
  //     );
  //     // category found
  //     if (Object.keys(categoryExists).length != 0) {
  //       return res.status(HttpStatus.CONFLICT).json({
  //         success: false,
  //         message: ' category exists',
  //         category: null,
  //       });
  //     }
  //     const category = await this.categoryService.create(createCategoryDto);
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'category successfully added',
  //       category: category,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to register user',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Get('all')
  // async findAll(@Res() res: Response): Promise<any> {
  //   try {
  //     const category = await this.categoryService.findAll();
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: 'category successfully added',
  //       category,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of categories',
  //       error: error.message,
  //     });
  //   }
  // }
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
