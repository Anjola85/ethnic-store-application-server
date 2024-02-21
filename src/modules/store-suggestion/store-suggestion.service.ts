import { StoreSuggestionListRespDto } from './../../contract/version1/response/store-suggestion-response.dto';
import { Injectable, Logger } from '@nestjs/common';
import { CreateStoreSuggestionDto } from './dto/create-store-suggestion.dto';
import { UpdateStoreSuggestionDto } from './dto/update-store-suggestion.dto';
import { StoreSuggestionRespDto } from 'src/contract/version1/response/store-suggestion-response.dto';
import { StoreSuggestion } from './entities/store-suggestion.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreSuggestionProcessor } from './store-suggestion.processor';
import { AddressService } from '../address/address.service';

@Injectable()
export class StoreSuggestionService {
  private logger = new Logger('StoreSuggestionService');

  constructor(
    @InjectRepository(StoreSuggestion)
    private storeSuggestionRepository: Repository<StoreSuggestion>,
    private addressService: AddressService,
  ) {}

  /**
   * This function adds a new store suggestion to the database
   * @param createStoreSuggestionDto
   * @returns
   */
  async add(
    createStoreSuggestionDto: CreateStoreSuggestionDto,
  ): Promise<StoreSuggestionRespDto> {
    try {
      const address = await this.addressService.addAddress(
        createStoreSuggestionDto.address,
      );

      const storeSuggestionEntity: StoreSuggestion = Object.assign(
        new StoreSuggestion(),
        createStoreSuggestionDto,
      );

      storeSuggestionEntity.address = address;

      const newStoreSuggestion = await this.storeSuggestionRepository.save(
        storeSuggestionEntity,
      );
      const resp: StoreSuggestionRespDto =
        StoreSuggestionProcessor.mapEntityToResp(newStoreSuggestion);
      return resp;
    } catch (error) {
      throw error;
    }
  }

  /**
   * This function fetches all store suggestions for a specific USER
   * @param userId
   * @returns
   */
  async findAll(userId: number): Promise<StoreSuggestionListRespDto> {
    try {
      const allStoreSuggestions = await this.storeSuggestionRepository
        .createQueryBuilder('storeSuggestion')
        .where('storeSuggestion.user.id = :id', { id: userId })
        .leftJoinAndSelect('storeSuggestion.address', 'address')
        .getMany();

      const resp: StoreSuggestionListRespDto =
        StoreSuggestionProcessor.mapEntityListToResp(allStoreSuggestions);

      return resp;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} storeSuggestion`;
  }

  update(id: number, updateStoreSuggestionDto: UpdateStoreSuggestionDto) {
    return `This action updates a #${id} storeSuggestion`;
  }

  remove(id: number) {
    return `This action removes a #${id} storeSuggestion`;
  }
}
