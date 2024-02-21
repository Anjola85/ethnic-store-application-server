import { Injectable } from '@nestjs/common';
import { CreateStoreSuggestionDto } from './dto/create-store-suggestion.dto';
import { UpdateStoreSuggestionDto } from './dto/update-store-suggestion.dto';

@Injectable()
export class StoreSuggestionService {
  create(createStoreSuggestionDto: CreateStoreSuggestionDto) {
    return 'This action adds a new storeSuggestion';
  }

  findAll() {
    return `This action returns all storeSuggestion`;
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
