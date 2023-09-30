import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { BusinessService } from './business.service';
import { BusinessDto } from './dto/business.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { GeoLocationDto } from './dto/geolocation.dto';
import { createError, createResponse } from 'src/common/util/response';
import { Response } from 'express';

@Controller('business')
export class BusinessController {
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
  async create(
    @Body() createBusinessDto: BusinessDto,
    @UploadedFiles() files: any,
    @Res() res: Response,
  ) {
    createBusinessDto.featuredImage = files?.featuredImage[0] || null;
    createBusinessDto.backgroundImage = files?.backgroundImage[0] || null;
    createBusinessDto.logoImage = files?.logoImage[0] || null;

    try {
      const createdBusiness = await this.businessService.register(
        createBusinessDto,
      );

      return res
        .status(HttpStatus.CREATED)
        .json(
          createResponse(
            'Business registered successfully',
            createdBusiness,
            true,
          ),
        );
    } catch (error) {
      return {
        success: false,
        message: 'Failed to register business',
        error: error.message,
      };
    }
  }

  // fetch nearby businesses by location - coordinates
  async findNearbyBusinesses(
    @Body() body: { latitude: number; longitude: number },
    @Res() res: Response,
  ): Promise<any> {
    try {
      const geolocationDto = new GeoLocationDto();
      geolocationDto.coordinates = [body.latitude, body.longitude];
      const businesses = await this.businessService.findNearbyBusinesses(
        geolocationDto,
      );
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json(createError('Failed to fetch nearby businesses', error.message));
    }
  }

  // /**
  //  * Gell all businesses by location
  //  */
  // @Post('nearby')
  // async findByLocation(
  //   @Body() body: { lat: number; lng: number; radius: number },
  //   @Res() res: Response,
  // ): Promise<any> {
  //   try {
  //     const business = await this.businessService.findStoresNearby(
  //       body.lat,
  //       body.lng,
  //       body.radius,
  //     );
  //     const length: number = Object.keys(business).length;
  //     return res.status(HttpStatus.CREATED).json({
  //       success: true,
  //       message: `Fetched ${length} businesses`,
  //       business,
  //     });
  //   } catch (error) {
  //     return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
  //       success: false,
  //       message: 'failed to get list of businesses',
  //       error: error.message,
  //     });
  //   }
  // }
}
