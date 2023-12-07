import { BusinessRepository } from './business.repository';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BusinessDto } from './dto/business.dto';
import { Repository } from 'typeorm';
import {
  BusinessFilesService,
  BusinessImages,
} from '../files/business-files.service';
import { ImagesDto } from './dto/image.dto';
import { Address } from '../address/entities/address.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { businessDtoToEntity } from './business-mapper';
import { GeoLocationDto } from './dto/geolocation.dto';
import { AddressService } from '../address/address.service';
import { Business } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    private businessRepository: BusinessRepository,
    private businessFileService: BusinessFilesService,
    private addressService: AddressService,
  ) {}

  async register(businessDto: BusinessDto): Promise<any> {
    await this.checkBusinessExist(businessDto);

    businessDto.address.id = await this.addressService.addAddress(
      businessDto.address,
    );

    await this.uploadBusinessImages(businessDto);

    // map business data
    const businessEntity: Business = businessDtoToEntity(businessDto);

    const createdBusiness = await this.businessRepository.addBusiness(
      businessEntity,
    );

    // map the business data back to businessDto

    // return the created business information
    return createdBusiness;
  }

  private async uploadBusinessImages(businessDto: BusinessDto) {
    const { featuredImage, backgroundImage, logoImage, ...businessData } =
      businessDto;

    // set the businessId to be name in AWS S3
    let businessName = businessDto.name;

    // replace the space in the business name with underscore
    businessName = businessName.replace(/\s/g, '_');
    const businessImages: BusinessImages = {
      business_id: businessName,
      background_blob: backgroundImage,
      logo_blob: logoImage,
      feature_image_blob: featuredImage,
    };

    const imagesUrl: ImagesDto =
      await this.businessFileService.uploadBusinessImages(businessImages);

    const images: ImagesDto = {
      background: imagesUrl.background,
      featured: imagesUrl.featured,
      logo: imagesUrl.logo,
    };

    // save the image url to the database
    businessDto.images = images;
  }

  private async checkBusinessExist(businessDto: BusinessDto): Promise<void> {
    const businessExists = await this.businessRepository.findByName(
      businessDto.name,
    );

    if (businessExists) {
      throw new HttpException(
        `Business with name ${businessExists.name} already exists`,
        HttpStatus.CONFLICT,
      );
    }
  }

  async findStoresNearby(geolocation: GeoLocationDto): Promise<any> {
    const businesses = await this.businessRepository.findNearbyBusinesses(
      geolocation,
    );

    return businesses;
  }

  // async findAll() {
  //   try {
  //     const businesses = await this.businessModel.find().exec();
  //     return businesses;
  //   } catch (error) {
  //     throw new Error(
  //       `Error retrieving all businesses from mongo
  //       \nfrom findAll method in business.service.ts.
  //       \nWith error message: ${error.message}`,
  //     );
  //   }
  // }

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
