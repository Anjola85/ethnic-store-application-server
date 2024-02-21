import { Module } from '@nestjs/common';
import { StoreSuggestionService } from './store-suggestion.service';
import { StoreSuggestionController } from './store-suggestion.controller';

@Module({
  controllers: [StoreSuggestionController],
  providers: [StoreSuggestionService]
})
export class StoreSuggestionModule {}
