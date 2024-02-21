import { Test, TestingModule } from '@nestjs/testing';
import { StoreSuggestionService } from './store-suggestion.service';

describe('StoreSuggestionService', () => {
  let service: StoreSuggestionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StoreSuggestionService],
    }).compile();

    service = module.get<StoreSuggestionService>(StoreSuggestionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
