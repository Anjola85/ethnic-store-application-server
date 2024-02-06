import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EnvConfigService } from '../config/env-config.service';

@Injectable()
export class BootstrapService implements OnModuleInit {
  private readonly logger = new Logger(BootstrapService.name);

  constructor(private envConfigService: EnvConfigService) {}

  async onModuleInit() {
    this.logger.log('Initializing BootstrapService...');
    await this.envConfigService.loadConfig();
    this.logger.log('BootstrapService initialized');
  }
}
