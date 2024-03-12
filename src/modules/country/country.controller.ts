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
  Logger,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { createResponse } from 'src/common/util/response';

@Controller('country')
export class CountryController {
  private readonly logger = new Logger(CountryController.name);
  constructor(private readonly countryService: CountryService) {}

  @Post('register')
  async create(@Body() createCountryDto: CreateCountryDto): Promise<any> {
    try {
      this.logger.debug('CountryController.create called');
      const resp = await this.countryService.create(createCountryDto);
      return createResponse('Country registered successfully', resp);
    } catch (err) {
      this.logger.debug(err);

      if (err instanceof ConflictException)
        throw new HttpException(err.message, HttpStatus.CONFLICT);

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // controlle to get all countries and their respective region

  @Get('all')
  async findAll(): Promise<any> {
    try {
      this.logger.debug('CountryController.findAll called');
      const countryList = await this.countryService.findAll();
      return createResponse('List of countries', countryList);
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all-info')
  async getAllWithRegion(): Promise<any> {
    try {
      this.logger.debug('CountryController.findAllWithRegion called');
      const countryList = await this.countryService.findAllWithRegion();
      return createResponse('List of countries with region', countryList);
    } catch (error) {
      this.logger.debug(error);

      if(error instanceof  HttpException)
        throw error

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
