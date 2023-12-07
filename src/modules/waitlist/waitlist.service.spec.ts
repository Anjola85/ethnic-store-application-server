import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistUsersService } from './waitlist.service';

describe('WaitlistUsersService', () => {
  let service: WaitlistUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WaitlistUsersService],
    }).compile();

    service = module.get<WaitlistUsersService>(WaitlistUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
