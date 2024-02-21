import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StoreSuggestionService } from './store-suggestion.service';
import { CreateStoreSuggestionDto } from './dto/create-store-suggestion.dto';
import { UpdateStoreSuggestionDto } from './dto/update-store-suggestion.dto';

@Controller('store-suggestion')
export class StoreSuggestionController {
  constructor(private readonly storeSuggestionService: StoreSuggestionService) {}

  @Post()
  create(@Body() createStoreSuggestionDto: CreateStoreSuggestionDto) {
    return this.storeSuggestionService.create(createStoreSuggestionDto);
  }

  @Get()
  findAll() {
    return this.storeSuggestionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.storeSuggestionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStoreSuggestionDto: UpdateStoreSuggestionDto) {
    return this.storeSuggestionService.update(+id, updateStoreSuggestionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.storeSuggestionService.remove(+id);
  }
}
