import { Test, TestingModule } from '@nestjs/testing';
import { SendgridController } from '../otp.controller';
import { SendgridService } from '../sendgrid/sendgrid.service';

describe('TwilioService', () => {
  let controller: SendgridController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SendgridController],
      providers: [SendgridService],
    }).compile();

    controller = module.get<SendgridController>(SendgridController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
