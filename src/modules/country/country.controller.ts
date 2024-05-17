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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { createResponse } from 'src/common/util/response';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('country')
export class CountryController {
  private readonly logger = new Logger(CountryController.name);
  constructor(private readonly countryService: CountryService) {}

  /**
   * TODO: add functionality to upload image
   * Method to register a country with its image
   * @param createCountryDto
   * @returns
   */
  @Post('register')
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createCountryDto: CreateCountryDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<any> {
    try {
      this.logger.debug('CountryController.create called');
      if (image) createCountryDto.image = image;
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

  /**
   * This method gets a country with its region and its continent
   * @returns
   */
  @Get('all-info')
  async getAllWithRegion(): Promise<any> {
    try {
      this.logger.debug('CountryController.findAllWithRegion called');
      const countryList = await this.countryService.findAllWithRegion();
      return createResponse('List of countries with region', countryList);
    } catch (error) {
      this.logger.debug(error);

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
