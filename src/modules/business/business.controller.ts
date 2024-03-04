import { Country } from './../country/entities/country.entity';
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
  Query,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { createResponse } from 'src/common/util/response';
import { Response } from 'express';
import { CreateBusinessDto } from './dto/create-business.dto';
import {
  BusinessListRespDto,
  BusinessRespDto,
} from 'src/contract/version1/response/business-response.dto';
import { GenericFilter } from '../common/generic-filter';

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
  async register(
    @Body() businessBody: CreateBusinessDto,
    @UploadedFiles() files: any,
  ) {
    try {
      this.logger.debug('Register business endpoint hit');
      businessBody.backgroundImage = files?.backgroundImage[0] || null;
      businessBody.profileImage = files?.profileImage[0] || null;

      const createdBusiness: BusinessRespDto =
        await this.businessService.register(businessBody);

      return createResponse(
        'Business registered successfully',
        createdBusiness,
      );
    } catch (error) {
      this.logger.debug(
        'From register in business.controller.ts with error:',
        error,
      );

      if (error instanceof HttpException) throw error;

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
      this.logger.debug('Nearby business endpoint hit');
      const businessList: BusinessListRespDto =
        await this.businessService.findStoresNearby(
          body.latitude,
          body.longitude,
        );
      return createResponse('Nearby businesses fetched successfully', {
        businessList,
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
      this.logger.debug('Get all businesses endpoint hit');
      const businessResp: BusinessListRespDto =
        await this.businessService.findAll();

      return createResponse('businesses fetched successfully', {
        businessResp,
      });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('list')
  async getAll(@Query() filter: GenericFilter): Promise<any> {
    try {
      this.logger.debug('Get all businesses endpoint hit');
      const businessResp: BusinessListRespDto =
        await this.businessService.getAllRelations(filter);
      return createResponse('businesses fetched successfully', {
        businessResp,
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
   * Get businesses by country
   * @param country
   * @returns
   */
  @Get('country/:country')
  async getBusinessByCountry(@Res() res: Response, country: string) {
    try {
      this.logger.debug('Get business by country endpoint hit');
      const businesses = await this.businessService.getBusinessByCountry(
        country,
      );
      return createResponse('Businesses fetched successfully', { businesses });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get businesses by region
   * @param region
   * @returns
   */
  @Get('region/:region')
  async getBusinessesByRegion(@Res() res: Response, region: string) {
    this.logger.debug('Get business by region endpoint hit');
    try {
      const businesses = await this.businessService.getBusinessesByRegion(
        region,
      );
      return createResponse('Businesses fetched successfully', { businesses });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // abillity to get business by name, id or email

  /**
   * Get business by name
   * @param name
   * @returns
   */

  //conuntu
  @Get('name/:name')
  async getBusinessByName(@Res() res: Response, name: string) {
    try {
      this.logger.debug('Get business by name endpoint hit');
      const business = await this.businessService.getBusinessByName(name);
      return createResponse('Business fetched successfully', { business });
    } catch (error) {
      this.logger.debug(error);
      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
