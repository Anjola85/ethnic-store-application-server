import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateContinentDto } from './dto/create-continent.dto';
import { UpdateContinentDto } from './dto/update-continent.dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  Continent,
  ContinentDocument,
  ContinentParams,
} from './entities/continent.entity';
import { Model } from 'mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ContinentService {
  private readonly logger = new Logger(ContinentService.name);
  constructor(
    @InjectRepository(Continent)
    protected continentRepository: Repository<Continent>,
  ) {}
  async create(createContinentDto: CreateContinentDto): Promise<any> {
    try {
      // check if continent already exists
      const continentExist = await this.continentRepository
        .createQueryBuilder('continent')
        .where('continent.name = :name', { name: createContinentDto.name })
        .getOne();

      if (continentExist) {
        this.logger.log(`Databse returned continentExist: ${continentExist}`);
        throw new ConflictException(
          `Continent with name ${createContinentDto.name} already exists`,
        );
      }

      const continent = new Continent();
      continent.name = createContinentDto.name;
      const newContinent = await this.continentRepository.save(continent);
      return newContinent;
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const continents = await this.continentRepository.find({
        select: ['name'],
      });
      return continents;
    } catch (error) {
      throw new Error(
        `Error retrieving all continents from mongo
        \nfrom findAll method in continent.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async findOne(params: ContinentParams): Promise<any> {
    try {
      const continent = await this.continentRepository
        .createQueryBuilder('continent')
        .where('continent.id = :id', { id: params.id })
        .orWhere('continent.name = :name', { name: params.name })
        .getOne();

      if (!continent) {
        if (params.id)
          throw new NotFoundException(`continent with  ${params} not found`);
        else if (params.name)
          throw new NotFoundException(`continent with  ${params} not found`);
      }

      if (continent.deleted)
        throw new NotFoundException(
          `continent with ${params} has been deleted`,
        );

      return continent;
    } catch (error) {
      throw new Error(
        `Error getting continent information for continent ${params},
        \nfrom findOne method in continent.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async update(
    id: string,
    updateContinentDto: UpdateContinentDto,
  ): Promise<any> {
    try {
      const cateogryResp = await this.continentRepository
        .createQueryBuilder('continent')
        .where('continent.id = :id', { id })
        .getOne();

      if (!cateogryResp)
        throw new NotFoundException(`continent with id ${id} not found`);

      cateogryResp.name = updateContinentDto.name;
      const updateContinent = await this.continentRepository.save(cateogryResp);

      return updateContinent;
    } catch (error) {
      throw new Error(
        `Error update continent information for continent with id ${id},
        \nfrom update method in continent.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }

  async remove(params: ContinentParams): Promise<boolean> {
    try {
      const continent = await this.findOne(params);
      continent.deleted = true;
      await this.continentRepository.save(continent);

      return true;
    } catch (error) {
      throw new Error(
        `Error from remove method in continent.service.ts.
        \nWith error message: ${error.message}`,
      );
    }
  }
}
