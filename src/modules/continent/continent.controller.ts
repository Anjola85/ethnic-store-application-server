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
import { ContinentService } from './continent.service';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import { Response } from 'express';

@Controller('continent')
export class ContinentController {
  constructor(private readonly continentService: ContinentService) {}

  @Post('register')
  async create(
    @Body() createContinentDto: CreateContinentDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // check if continent exists
      const continentExists = await this.continentService.findContinentByName(
        createContinentDto.name,
      );

      // continent found
      if (Object.keys(continentExists).length != 0) {
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: ' continent exists',
          continent: null,
        });
      }

      const continent = await this.continentService.create(createContinentDto);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'continent successfully added',
        continent: continent,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to register user',
        error: err.message,
      });
    }
  }

  @Get('all')
  async findAll(@Res() res: Response): Promise<any> {
    try {
      const continent = await this.continentService.findAll();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'continent successfully added',
        continent,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to get list of continents',
        error: error.message,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
    try {
      const continent = await this.continentService.findOne(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'user information fetched',
        continent,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to retrieve continent information',
        error: err.message,
      });
    }
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateContinentDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.continentService.update(id, updateUserDto);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'continent information updated',
        continent: updateUserDto.name,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to update continent information',
        error: err.message,
      });
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.continentService.remove(id);
  }
}
