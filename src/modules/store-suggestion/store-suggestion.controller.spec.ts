import { Test, TestingModule } from '@nestjs/testing';
import { StoreSuggestionController } from './store-suggestion.controller';
import { StoreSuggestionService } from './store-suggestion.service';

describe('StoreSuggestionController', () => {
  let controller: StoreSuggestionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreSuggestionController],
      providers: [StoreSuggestionService],
    }).compile();

    controller = module.get<StoreSuggestionController>(StoreSuggestionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
