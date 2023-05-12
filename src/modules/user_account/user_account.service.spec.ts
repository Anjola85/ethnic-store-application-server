import { Test, TestingModule } from '@nestjs/testing';
import { UserAccountService } from './user_account.service';

describe('UserAccountService', () => {
  let service: UserAccountService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserAccountService],
    }).compile();

    service = module.get<UserAccountService>(UserAccountService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
