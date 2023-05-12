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
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { Response } from 'express';

@Controller('country')
export class CountryController {
  constructor(private readonly countryService: CountryService) {}

  @Post('register')
  async create(
    @Body() createCountryDto: CreateCountryDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // check if country exists
      const countryExists = await this.countryService.findCountryByName(
        createCountryDto.name,
      );

      // country found
      if (Object.keys(countryExists).length != 0) {
        return res.status(HttpStatus.CONFLICT).json({
          success: false,
          message: ' country exists',
          country: null,
        });
      }

      const country = await this.countryService.create(createCountryDto);

      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'country successfully added',
        country: country,
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
      const country = await this.countryService.findAll();
      return res.status(HttpStatus.CREATED).json({
        success: true,
        message: 'country successfully added',
        country,
      });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to get list of categories',
        error: error.message,
      });
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response): Promise<any> {
    try {
      const country = await this.countryService.findOne(id);

      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'user information fetched',
        country,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to retrieve country information',
        error: err.message,
      });
    }
  }

  @Patch('update/:id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateCountryDto,
    @Res() res: Response,
  ): Promise<any> {
    try {
      await this.countryService.update(id, updateUserDto);
      return res.status(HttpStatus.OK).json({
        success: true,
        message: 'country information updated',
        country: updateUserDto.name,
      });
    } catch (err) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'failed to update country information',
        error: err.message,
      });
    }
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.countryService.remove(id);
  }
}
