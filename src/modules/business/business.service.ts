import { BusinessRepository } from './business.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BusinessDto } from './dto/business.dto';
import {
  S3BusinessImagesRequest,
  S3BusinessImagesResponse,
} from './dto/image.dto';
import { GeoLocationDto } from './dto/geolocation.dto';
import { AddressService } from '../address/address.service';
import { Business } from './entities/business.entity';
import { BusinessRequestDto } from './dto/business.request';
import { BusinessFilesService } from '../files/business-files.service';

@Injectable()
export class BusinessService {
  constructor(
    private businessRepository: BusinessRepository,
    private businessFileService: BusinessFilesService,
    private addressService: AddressService,
  ) {}

  async register(reqBody: BusinessRequestDto): Promise<any> {
    console.log('req body is: ', reqBody);
    const businessExist = await this.businessRepository.findByUniq({
      name: reqBody.name,
      email: reqBody.email,
    });

    if (businessExist)
      throw new HttpException(
        `Business with name ${businessExist.name} already exists`,
        HttpStatus.CONFLICT,
      );

    const businessDto: BusinessDto = Object.assign(new BusinessDto(), reqBody);

    businessDto.address.id = await this.addressService.addAddress(
      reqBody.address,
    );

    const {
      profileImage,
      featuredImage,
      backgroundImage,
    }: S3BusinessImagesResponse = await this.processBusinessImages(reqBody);

    // map the returned images to the businessDto
    businessDto.images = {
      profileImage: profileImage,
      featuredImage: featuredImage,
      backgroundImage: backgroundImage,
    };

    // map business dto data to business entity
    const businessEntity: Business = Object.assign(new Business(), businessDto);

    // save the business to the database
    const createdBusiness = await this.businessRepository.addBusiness(
      businessEntity,
    );

    return createdBusiness;
  }

  /**
   * Does necessary mapping and uploads business images to AWS S3
   * @param businessDto
   * @returns
   */
  private async processBusinessImages(
    businessDto: BusinessRequestDto,
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
