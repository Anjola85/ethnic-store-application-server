import { Controller } from '@nestjs/common';
import { MobileService } from './mobile.service';

@Controller('mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}
}
