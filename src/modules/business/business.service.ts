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

@Injectable()
export class BusinessService {
  private readonly logger = new Logger(BusinessService.name);

  constructor(
    private businessRepository: BusinessRepository,
    private businessFileService: BusinessFilesService,
    private addressService: AddressService,
    private mobileService: MobileService,
  ) {}

  /**
   * Register a business
   * @param reqBody
   * @returns
   */
  async register(reqBody: CreateBusinessDto): Promise<any> {
    try {
      const { businessExist, type } = await this.businessRepository.findByUniq({
        name: reqBody.name,
        email: reqBody.email,
      });

      if (businessExist) {
        this.logger.debug(`Business with ${type} already exists`);
        throw new HttpException(
          `Business with ${type} already exists`,
          HttpStatus.CONFLICT,
        );
      }

      // map request object of DTO
      const businessDto: CreateBusinessDto = Object.assign(
        new CreateBusinessDto(),
        reqBody,
      );

      const mobile = await this.mobileService.addMobile(reqBody.mobile, false);

      const address = await this.addressService.addAddress(reqBody.address);

      // S3 integratino should run below regardless of whether the user has uploaded images or not
      if (
        businessDto.images &&
        (businessDto.images.backgroundImage ||
          businessDto.images.featuredImage ||
          businessDto.images.profileImage)
      ) {
        const { profileImage, backgroundImage }: S3BusinessImagesResponse =
          await this.processBusinessImages(reqBody);

        businessDto.images = {
          profileImage: profileImage,
          backgroundImage: backgroundImage,
        };
      }

      // map business dto data to business entity
      const businessEntity: Business = Object.assign(
        new Business(),
        businessDto,
      );

      // save the business to the database
      const createdBusiness = await this.businessRepository
        .create(businessEntity)
        .save();

      return createdBusiness;
    } catch (error) {
      this.logger.debug(
        `Error thrown in business.service.ts, register method: ${error.message}`,
      );
      throw new Error(
        `Error from register method in business.service.ts.
    \nWith error message: ${error.message}`,
      );
    }
  }

  /**
   * Does necessary mapping and uploads business images to AWS S3
   * @param businessDto
   * @returns
   */
  private async processBusinessImages(
    businessDto: CreateBusinessDto,
  ): Promise<S3BusinessImagesResponse> {
    const { featuredImage, backgroundImage, profileImage } = businessDto;

    // set the businessId to be name in AWS S3 since name is always unique
    let businessName = businessDto.name;

    // replace the space in the business name with underscore
    businessName = businessName.replace(/\s/g, '_');
    const businessImages: S3BusinessImagesRequest = {
      business_id: businessName,
      background_image_blob: backgroundImage,
      profile_image_blob: profileImage,
      featured_image_blob: featuredImage,
    };

    const imagesUrl: S3BusinessImagesResponse =
      await this.businessFileService.uploadBusinessImagesToS3(businessImages);

    return imagesUrl;
  }

  async findStoresNearby(geolocation: GeoLocationDto): Promise<any> {
    const businesses = await this.businessRepository.findNearbyBusinesses(
      geolocation,
    );

    return businesses;
  }

  async findAll() {
    try {
      const businesses = await this.businessRepository.find();
      return businesses;
    } catch (error) {
      throw new Error(
        `Error retrieving all businesses from mongo
        \nfrom findAll method in business.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  // async findOne(id: string): Promise<any> {
  //   try {
  //     const business = await this.businessModel.findById(id).exec();
  //     // throw error if business does not exist
  //     if (!business) {
  //       throw new Error(`business with id ${id} not found`);
  //     }

  //     if (business.deleted) {
  //       throw new Error(`business with id ${id} has been deleted`);
  //     }

  //     return business;
  //   } catch (error) {
  //     throw new Error(
  //       `Error getting business information for business with id ${id},
  //       \nfrom findOne method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // async update(
  //   id: string,
  //   updateBusinessDto: UpdateBusinessDto,
  // ): Promise<void> {
  //   try {
  //     await this.businessModel.updateOne({
  //       _id: id,
  //       ...updateBusinessDto,
  //     });
  //   } catch (error) {
  //     throw new Error(
  //       `Error update business information for business with id ${id},
  //       \nfrom update method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // async remove(id: string): Promise<any> {
  //   try {
  //     const business = await this.businessModel
  //       .findById(id, { deleted: 'true' })
  //       .exec();

  //     if (!business) {
  //       throw new Error(
  //         `Mongoose error with deleting business with business id ${id}
  //         In remove method business.service.ts with dev error message: business with id:${id} not found`,
  //       );
  //     }

  //     return business;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from remove method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  * Find business by name
  //  * @param name
  //  * @returns
  //  */
  // async findBusinessByName(name: string): Promise<any> {
  //   try {
  //     const business = await this.businessModel.find({ name }).exec();
  //     return business;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from findBusinessByName method in business.service.ts.
  //         \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  * Find all businesses with this category name
  //  * @returns {*} - businesses belonging to this category
  //  */
  // async findByCategory(categoryName: string): Promise<any> {
  //   try {
  //     // get businesses with this category name
  //     const business = await this.businessModel
  //       .find({ 'category.name': categoryName })
  //       .exec();

  //     return business;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from findByCategory method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // /**
  //  * Find all businesses with this country name
  //  * @param countryName
  //  * @returns {*} - businesses belonging to this country
  //  */
  // async findByCountry(countryName: string): Promise<any> {
  //   try {
  //     // get businesses with this country name
  //     const business = await this.businessModel
  //       .find({ 'country.name': countryName })
  //       .exec();

  //     return business;
  //   } catch (error) {
  //     throw new Error(`Error from findByCountry method in business.service.ts.
  //     \nWith error message: ${error.message}`);
  //   }
  // }

  // /**
  //  * Find all businesses with this continent name
  //  * @param continentName
  //  * @returns {*} - businesses belonging to this continent
  //  */
  // async findByContinent(continentName: string): Promise<any> {
  //   try {
  //     // get businesses with this continent name
  //     const business = await this.businessModel
  //       .find({ 'continent.name': continentName })
  //       .exec();

  //     return business;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from findByCategory method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

  // async findStoresNearby(
  //   latitude: number,
  //   longitude: number,
  //   radius: number,
  // ): Promise<Business[]> {
  //   try {
  //     const coordinates = [latitude, longitude];
  //     const businesses = await this.businessModel
  //       .find({
  //         geolocation: {
  //           $near: {
  //             $geometry: {
  //               type: 'Point',
  //               coordinates,
  //             },
  //             $maxDistance: radius,
  //           },
  //         },
  //       })
  //       .exec();

  //     return businesses;
  //   } catch (error) {
  //     throw new Error(
  //       `Error from findStoresNearby method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }
}
