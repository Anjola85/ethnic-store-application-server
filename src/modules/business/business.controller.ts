import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
  Logger,
  HttpException,
  Get,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessDto } from './dto/business.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GeoLocationDto } from './dto/geolocation.dto';
import { createError, createResponse } from 'src/common/util/response';
import { Response } from 'express';
import { BusinessRequestDto } from './dto/business.request';

@Controller('business')
export class BusinessController {
  private readonly logger = new Logger(BusinessController.name);

  constructor(private readonly businessService: BusinessService) {}

  /**
   * Register a new business
   * @param createBusinessDto
   * @param res
   * @returns
   */
  @Post('register')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'featuredImage', maxCount: 1 },
      { name: 'backgroundImage', maxCount: 1 },
      { name: 'logoImage', maxCount: 1 },
    ]),
  )
  async register(@Body() requestBody: any, @UploadedFiles() files: any) {
    console.log('requestBody: ', JSON.stringify(requestBody, null, 2));

    const businessBody = Object.assign(new BusinessRequestDto(), requestBody);

    // replace the images with the placeholder images from s3
    businessBody.featuredImage = files?.featuredImage[0] || null;
    businessBody.backgroundImage = files?.backgroundImage[0] || null;
    businessBody.logoImage = files?.logoImage[0] || null;

    try {
      const createdBusiness = await this.businessService.register(businessBody);

      return createResponse('Business registered successfully', {
        business: createdBusiness,
      });
    } catch (error) {
      this.logger.debug('From register in business.controller.ts ', error);

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Fetch nearby businesses by location - coordinates
   * @param body
   * @param res
   * @returns
   */
  @Post('nearby')
  async findNearbyBusinesses(
    @Body() body: { latitude: number; longitude: number },
  ): Promise<any> {
    try {
      const geolocationDto = new GeoLocationDto();
      geolocationDto.coordinates = [body.latitude, body.longitude];
      const businesses = await this.businessService.findStoresNearby(
        geolocationDto,
      );
      return createResponse('Nearby businesses fetched successfully', {
        businesses,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Gell all businesses by location
   */
  @Get('all')
  async findAll(): Promise<any> {
    try {
      const business = await this.businessService.findAll();
      const length: number = Object.keys(business).length;
      return createResponse('businesses fetched successfully', {
        business,
        length,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
