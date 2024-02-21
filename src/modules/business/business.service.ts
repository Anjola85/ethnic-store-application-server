import { CountryService } from './../country/country.service';
import { MobileService } from './../mobile/mobile.service';
import { BusinessRepository } from './business.repository';
import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import {
  S3BusinessImagesRequest,
  S3BusinessImagesResponse,
} from './dto/image.dto';
import { GeoLocationDto } from './dto/geolocation.dto';
import { AddressService } from '../address/address.service';
import { Business } from './entities/business.entity';
import { BusinessFilesService } from '../files/business-files.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { AwsS3Service } from '../files/aws-s3.service';
import { AddressProcessor } from '../address/address.processor';
import { Country } from '../country/entities/country.entity';
import { Region } from '../region/entities/region.entity';
import { BusinessProcessor } from './business.process';
import {
  BusinessListRespDto,
  BusinessRespDto,
} from 'src/contract/version1/response/business-response.dto';

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private businessRepository: BusinessRepository,
    private businessFileService: BusinessFilesService,
    private addressService: AddressService,
    private mobileService: MobileService,
    private awsS3Service: AwsS3Service,
    private countryService: CountryService,
  ) {}

  /**
   * Register a business
   * @param reqBody
   * @returns
   */
  async register(reqBody: CreateBusinessDto): Promise<BusinessRespDto> {
    try {
      console.log('register business api received: ', reqBody);

      await this.businessExist(reqBody);

      // map request object of DTO
      const businessDto: CreateBusinessDto = Object.assign(
        new CreateBusinessDto(),
        reqBody,
      );

      // save to mobile table
      const mobileEntity = await this.mobileService.registerMobile(
        reqBody.mobile,
      );

      // save to address table
      const addressEntity = await this.addressService.addAddress(
        reqBody.address,
      );

      const businessEntity: Business =
        BusinessProcessor.mapCreateBusinessDtoToEntity(businessDto);

      // TODO: handle business images here

      businessEntity.mobile = mobileEntity;
      businessEntity.address = addressEntity;

      // save the business to the database
      const createdBusiness = await this.businessRepository.save(
        businessEntity,
      );

      const resp: BusinessRespDto =
        BusinessProcessor.mapEntityToResp(createdBusiness);

      return resp;
    } catch (error) {
      this.logger.debug(
        'From register in business.service.ts with error:',
        error,
      );

      if (error.message.includes('violates foreign key constraint')) {
        throw new HttpException(
          `Country or region does not exist`,
          HttpStatus.NOT_FOUND,
        );
      }

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        "We're working on it",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async setBusinessImage(
    businessDto: CreateBusinessDto,
    reqBody: CreateBusinessDto,
  ) {
    if (businessDto.backgroundImage || businessDto.profileImage) {
      // upload business images to AWS S3
      const { profileImage, backgroundImage }: S3BusinessImagesResponse =
        await this.processBusinessImages(reqBody);

      businessDto.images = {
        profileImage: profileImage,
        backgroundImage: backgroundImage,
      };
    } else {
      // get default image from S3
      const defaultStoreImage: string = await this.awsS3Service.getImageUrl(
        'defaultStore.png',
      );
      if (!defaultStoreImage) {
        this.logger.error('Default store image not found');
      }
      businessDto.images = {
        profileImage: defaultStoreImage || '',
        backgroundImage: defaultStoreImage || '',
      };
    }
  }

  /**
   * uses email or name to check if business exits
   * @param reqBody
   * @throws HttpException if business exists
   */
  private async businessExist(reqBody: CreateBusinessDto) {
    const { businessExist, type } = await this.businessRepository.findByUniq({
      name: reqBody.name,
      email: reqBody.email,
    });

    if (businessExist)
      throw new HttpException(
        `Business with ${type} already exists`,
        HttpStatus.CONFLICT,
      );
  }

  async findStoresNearby(
    geolocation: GeoLocationDto,
  ): Promise<BusinessListRespDto> {
    const businesses = await this.businessRepository.findNearbyBusinesses(
      geolocation,
    );

    const businessList = BusinessProcessor.mapEntityListToResp(businesses);

    return businessList;
  }

  async findAll() {
    try {
      const businesses = await this.businessRepository.getAllRelation();

      const businessList: BusinessListRespDto =
        BusinessProcessor.mapEntityListToResp(businesses);

      return businessList;
    } catch (error) {
      throw new Error(
        `Error retrieving all businesses from DB
        \nfrom findAll method in business.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async getBusinessByCountry(country: string): Promise<any> {
    const businesses = await this.businessRepository.findByCountry(country);
    return businesses;
  }

  async getBusinessesByRegion(region: string): Promise<any> {
    const businesses = await this.businessRepository.findByRegion(region);
    return businesses;
  }

  /**
   * Helper method
   * Does necessary mapping and uploads business images to AWS S3
   * @param businessDto
   * @returns
   */
  private async processBusinessImages(
    businessDto: CreateBusinessDto,
  ): Promise<S3BusinessImagesResponse> {
    const { backgroundImage, profileImage } = businessDto;

    // set the businessId to be name in AWS S3 since name is always unique
    let businessName = businessDto.name;

    // replace the space in the business name with underscore
    businessName = businessName.replace(/\s/g, '_');
    const businessImages: S3BusinessImagesRequest = {
      business_id: businessName,
      background_image_blob: backgroundImage,
      profile_image_blob: profileImage,
    };

    const imagesUrl: S3BusinessImagesResponse =
      await this.businessFileService.uploadBusinessImagesToS3(businessImages);

    return imagesUrl;
  }
}
