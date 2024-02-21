import { Module } from '@nestjs/common';
import { StoreSuggestionService } from './store-suggestion.service';
import { StoreSuggestionController } from './store-suggestion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreSuggestion } from './entities/store-suggestion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([StoreSuggestion])],
  controllers: [StoreSuggestionController],
  providers: [StoreSuggestionService],
})
export class StoreSuggestionModule {}
