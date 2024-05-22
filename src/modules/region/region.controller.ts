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
  UploadedFile,
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
  async create(
    @Body() createRegionDto: CreateRegionDto,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<any> {
    try {
      this.logger.debug('RegionController.create called');
      if (image) createRegionDto.image = image;
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
      this.logger.debug('region/all api called');
      const payload = await this.regionService.findAll();
      this.logger.debug('Fetched all regions');
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
  async update(
    @Param('id') id: string,
    @Body() updateRegionDto: UpdateRegionDto,
    @UploadedFile() image?: Express.Multer.File,
  ) {
    try {
      this.logger.debug('RegionController.update called');
      if (image) updateRegionDto.image = image;
      const response = await this.regionService.update(+id, updateRegionDto);
      return createResponse('Region updated successfully', response);
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
