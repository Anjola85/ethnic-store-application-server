import { RegionProcessor } from './region.process';
import { ConflictException, Injectable, Logger } from '@nestjs/common';
import { CreateRegionDto } from './dto/create-region.dto';
import { UpdateRegionDto } from './dto/update-region.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Region } from './entities/region.entity';
import {
  RegionListRespDto,
  RegionRespDto,
} from 'src/contract/version1/response/region-response.dto';
import { AppDataSource } from 'src/config/app-data-source';
import { AwsS3Service } from '../files/aws-s3.service';
import * as path from 'path';

@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  constructor(
    @InjectRepository(Region)
    protected regionRepository: Repository<Region>,
    private awsS3Service: AwsS3Service,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<RegionRespDto> {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const region = new Region();
      Object.assign(region, createRegionDto);

      const newRegion = await this.regionRepository.save(region);
      await queryRunner.commitTransaction();

      // process response
      const regionRespDto: RegionRespDto =
        RegionProcessor.mapEntityToResp(newRegion);

      if (createRegionDto.image) {
        const extension = path.extname(createRegionDto.image.originalname);
        const imageUrl = await this.awsS3Service.uploadImgToFolder(
          `server/geographic_images/regions/${createRegionDto.name}${extension}`,
          createRegionDto.image.buffer,
        );

        // Start a new transaction to update the image URL
        await queryRunner.startTransaction();
        newRegion.imageUrl = imageUrl;

        const updatedRegion = await queryRunner.manager.save(newRegion);
        await queryRunner.commitTransaction();

        regionRespDto.imageUrl = updatedRegion.imageUrl;
      }

      return regionRespDto;
    } catch (error) {
      this.logger.debug(error);

      if (
        error.name === 'QueryFailedError' &&
        error.message.includes('duplicate key value violates unique constraint')
      ) {
        this.logger.error(
          `Attempted to create a region with a duplicate name: ${createRegionDto.name}`,
        );

        throw new ConflictException(
          `Region with name ${createRegionDto.name} already exists`,
        );
      }

      throw error;
    }
  }

  async findAll(): Promise<RegionListRespDto> {
    try {
      const regions = await this.regionRepository.find({
        select: ['name', 'id', 'imageUrl'],
        order: {
          id: 'ASC',
        },
      });
      const regionList: RegionListRespDto =
        RegionProcessor.mapEntityListToResp(regions);
      return regionList;
    } catch (error) {
      this.logger.debug(error);

      throw new Error(
        `Error retrieving all region from mongo
        \nfrom findAll method in region.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(id: number, updateRegionDto: UpdateRegionDto): Promise<any> {
    try {
      // get one region
      const updatedRegion: Region = await this.regionRepository
        .createQueryBuilder()
        .where('id = :id', { id })
        .getOne();

      // update the region
      Object.assign(updatedRegion, updateRegionDto);

      // save the updated region
      await this.regionRepository.save(updatedRegion);

      // map the region back to response dto
      const regionResponse = RegionProcessor.mapEntityToResp(updatedRegion);
      return regionResponse;
    } catch (error) {
      this.logger.debug('Error occurred in region service');
      throw error;
    }
  }

  async findOne(id: number): Promise<any> {
    try {
      const region = await this.regionRepository.findOneBy({ id });
      if (!region) throw new Error('Region not found');
      return region;
    } catch (error) {
      throw error;
    }
  }
}
