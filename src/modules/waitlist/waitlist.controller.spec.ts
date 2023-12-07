import { Test, TestingModule } from '@nestjs/testing';
import { WaitlistUsersController } from './waitlist.controller';
import { WaitlistUsersService } from './waitlist.service';

describe('WaitlistUsersController', () => {
  let controller: WaitlistUsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitlistUsersController],
      providers: [WaitlistUsersService],
    }).compile();

    controller = module.get<WaitlistUsersController>(WaitlistUsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
