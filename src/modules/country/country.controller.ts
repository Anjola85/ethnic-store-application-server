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
import { UpdateCountryDto } from './dto/update-country.dto';
import { Response } from 'express';
import { createResponse } from 'src/common/util/response';

@Controller('country')
export class CountryController {
  private readonly logger = new Logger(CountryController.name);

  constructor(private readonly countryService: CountryService) {}
  @Post('register')
  async create(@Body() createCountryDto: CreateCountryDto): Promise<any> {
    try {
      const resp = await this.countryService.create(createCountryDto);

      return createResponse('Country registered successfully', resp);
    } catch (err) {
      this.logger.debug(err);

      if (err instanceof ConflictException) {
        throw new HttpException(err.message, HttpStatus.CONFLICT);
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
      const country = await this.countryService.findAll();
      return createResponse('List of countries', {
        result: country,
        size: country.length,
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
  //     const country = await this.countryService.findOne(id);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'user information fetched',
  //       country,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to retrieve country information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Patch('update/:id')
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateUserDto: UpdateCountryDto,
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     await this.countryService.update(id, updateUserDto);
  //     return res.status(HttpStatus.OK).json({
  //       success: true,
  //       message: 'country information updated',
  //       country: updateUserDto.name,
  //     });
  //   } catch (err) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to update country information',
  //       error: err.message,
  //     });
  //   }
  // }
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.countryService.remove(id);
  // }
}
