import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Logger,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RegionService } from './region.service';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { createResponse } from 'src/common/util/response';

@Controller('region')
export class RegionController {
  private readonly logger = new Logger(RegionController.name);
  constructor(private readonly regionService: RegionService) {}

  @Post('register')
  async create(@Body() createRegionDto: CreateRegionDto) {
    try {
      this.logger.debug('RegionController.create called');
      const resp = await this.regionService.create(createRegionDto);
      return createResponse('Region registered successfully', resp);
    } catch (error) {
      this.logger.debug(error);

      if (error instanceof ConflictException)
        throw new HttpException(error.message, HttpStatus.CONFLICT);

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll() {
    try {
      this.logger.debug('RegionController.findAll called');
      const payload = await this.regionService.findAll();
      return createResponse('List of regions', {
        result: payload,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    try {
      this.logger.debug('RegionController.findOne called');
      return this.regionService.findOne(+id);
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRegionDto: UpdateRegionDto) {
    try {
      this.logger.debug('RegionController.update called');
      return this.regionService.update(+id, updateRegionDto);
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
