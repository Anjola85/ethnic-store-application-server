/**
 * @see
 * This service is responsible for loading the environment variables from SSM
 * and making them available to the application
 *
 * Improvement: default loading of variables to local .env file if not on AWS SSM
 *
 */
import { Logger } from '@nestjs/common';
import { SecretsManagerClient } from '@aws-sdk/client-secrets-manager';
import * as dotenv from 'dotenv';
import { GetParameterCommand, SSMClient } from '@aws-sdk/client-ssm';

export class EnvConfigService {
  private readonly logger = new Logger(EnvConfigService.name);
  private static appConfig: Record<string, string> = {};
  private static configLoaded = false;
  private readonly ssmClient: SSMClient;
  private readonly secretsManagerClient: SecretsManagerClient;
  private currentEnv: string;

  constructor() {
    const isProd = isProduction();
    this.secretsManagerClient = new SecretsManagerClient({
      region: 'ca-central-1',
      credentials: !isProd
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });

    this.ssmClient = new SSMClient({
      region: 'ca-central-1',
      credentials: !isProd
        ? {
            accessKeyId: process.env.AWS_ACCESS_KEY,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          }
        : undefined,
    });

    this.currentEnv = isProd ? 'prod' : 'dev';
    // this.currentEnv = 'prod'; // TODO: comment when staging has been added
  }

  /**
   * Loads the environment variables from SSM
   */
  public async loadConfig(): Promise<void> {
    if (EnvConfigService.configLoaded) return;

    this.logger.debug('Loading environment variables');

    dotenv.config();

    const parametersToLoad = [
      { name: 'AWS_ACCESS_KEY', isSecure: true },
      { name: 'AWS_SECRET_ACCESS_KEY', isSecure: true },
      { name: 'DB_PORT', isSecure: false },
      { name: 'DB_NAME', isSecure: true },
      { name: 'DB_HOST', isSecure: true },
      { name: 'DB_USER', isSecure: true },
      { name: 'DB_PASSWORD', isSecure: true },
      { name: 'SECRET_KEY', isSecure: true },
      { name: 'AWS_REGION', isSecure: false },
      { name: 'AWS_BUCKET_NAME', isSecure: false },
      { name: 'AWS_BUCKET_REGION', isSecure: false },
      { name: 'AWS_KMS_KEY_ID', isSecure: true },
      { name: 'GCP_GEOCODING_API_KEY', isSecure: true },
      { name: 'TWILIO_ACCOUNT_SID', isSecure: true },
      { name: 'TWILIO_AUTH_TOKEN', isSecure: true },
      { name: 'TWILIO_PHONE_NUMBER', isSecure: true },
      { name: 'SENDGRID_API_KEY', isSecure: true },
      { name: 'WAITLIST_ID', isSecure: true },
      { name: 'JWT_SECRET_KEY', isSecure: true },
      { name: 'ENV', isSecure: false },
    ];

    for (const params of parametersToLoad) {
      // if not in production and the variable is set in local .env file, load it from there
      if (!isProduction() && process.env[params.name]) {
        this.logger.debug(
          `Loading ${params.name} from local .env file with value: ${
            process.env[params.name]
          }`,
        );
        EnvConfigService.appConfig[params.name] = process.env[params.name];
        continue;
      }

      this.logger.debug(`Loading ${params.name} from SSM`);
      const command = new GetParameterCommand({
        Name: `/prod/q1/config/${params.name}`,
        WithDecryption: params.isSecure,
      });

      try {
        // TODO: issue here
        const resp = await this.ssmClient.send(command);
        this.logger.debug(
          `Loaded ${params.name} from SSM successfully with value: ${resp.Parameter?.Value}`,
        );
        const Parameter = resp.Parameter;
        EnvConfigService.appConfig[params.name] = Parameter?.Value || '';
      } catch (error) {
        this.logger.error(
          `Failed to load ${params.name} from SSM with error: ${error}`,
        );
        throw new Error(
          `Failed to load ${params.name} from SSM with error: ${error}`,
        );
      }
    }

    // TODO: keep retying failed variables that didnt load in the background
  }

  static get(key: string): string {
    return this.appConfig[key];
  }

  public setAppConfig(appConfig: Record<string, string>): void {
    EnvConfigService.appConfig = appConfig;
  }

  public getAppConfig(): Record<string, string> {
    return EnvConfigService.appConfig;
  }

  public validateConfig() {
    // console.log('Validating config environment variables');
    this.logger.debug('Validating config environment variables');
    const requiredConfig = [
      'AWS_ACCESS_KEY',
      'AWS_SECRET_ACCESS_KEY',
      'SECRET_KEY',
      'AWS_REGION',
      'AWS_BUCKET_NAME',
      'AWS_BUCKET_REGION',
      'DB_PORT',
      'AWS_KMS_KEY_ID',
      'DB_NAME',
      'DB_HOST',
      'DB_USER',
      'DB_PASSWORD',
      'GCP_GEOCODING_API_KEY',
      'TWILIO_ACCOUNT_SID',
      'TWILIO_AUTH_TOKEN',
      'TWILIO_PHONE_NUMBER',
      'SENDGRID_API_KEY',
      'WAITLIST_ID',
    ];
    const missingConfig = requiredConfig.filter(
      (config) => !EnvConfigService.appConfig[config],
    );

    if (missingConfig.length) {
      const missingConfigList = missingConfig.join(', ');
      this.logger.error(`Missing critical config in SSM: ${missingConfigList}`);

      throw new Error(
        `Critical configurations are missing in SSM: ${missingConfigList}. Application cannot start.`,
      );
    }
  }

  public getFromDotenv(key: string): string {
    return process.env[key];
  }
}

export const isProduction = (): boolean => {
  if (process.env.ENV === 'staging') return false;
  return true;
};
