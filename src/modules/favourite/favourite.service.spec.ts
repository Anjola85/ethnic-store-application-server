import { Test, TestingModule } from '@nestjs/testing';
import { FavouriteService } from './favourite.service';

describe('FavouriteService', () => {
  let service: FavouriteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FavouriteService],
    }).compile();

    service = module.get<FavouriteService>(FavouriteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
