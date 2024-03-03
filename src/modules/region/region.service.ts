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

@Injectable()
export class RegionService {
  private readonly logger = new Logger(RegionService.name);

  constructor(
    @InjectRepository(Region)
    protected regionRepository: Repository<Region>,
  ) {}

  async create(createRegionDto: CreateRegionDto): Promise<RegionRespDto> {
    try {
      const region = new Region();
      Object.assign(region, createRegionDto);
      const newRegion = await this.regionRepository.save(region);
      const resp = RegionProcessor.mapEntityToResp(newRegion);
      return resp;
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
        select: ['name', 'id'],
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
      return null;
    } catch (error) {
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
