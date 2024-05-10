/**
 * @see
 * This service is responsible for loading the environment variables from SSM
 * and making them available to the application
 *
 * Improvement: default loading of variables to local .env file if not on AWS SSM
 *
 */
import { Global, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';

export class EnvConfigService {
  private readonly logger = new Logger(EnvConfigService.name);
  private static appConfig: Record<string, string> = {};
  private static configLoaded = false;
  private readonly ssmCLient: AWS.SSM;
  private currentEnv: string;

  constructor() {
    const isProd = isProduction();
    if (!isProd) {
      this.ssmCLient = new AWS.SSM({
        accessKeyId: process.env.AWS_ACCESS_KEY,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'ca-central-1',
      });
    } else {
      this.ssmCLient = new AWS.SSM({
        region: 'ca-central-1',
      });
    }

    this.currentEnv = isProd ? 'prod' : 'dev';
    // this.currentEnv = 'prod'; // TODO: comment when staging has been added
  }

  /**
   * Loads the environment variables from SSM
   */
  public async loadConfig(): Promise<void> {
    if (EnvConfigService.configLoaded) return;

    this.logger.debug('Loading environment variables');

    const parametersToLoad = [
      { name: 'DB_PORT', isSecure: false },
      { name: 'DB_NAME', isSecure: true },
      { name: 'DB_HOST', isSecure: true },
      { name: 'DB_USER', isSecure: true },
      { name: 'DB_PASSWORD', isSecure: true },
      { name: 'AWS_ACCESS_KEY', isSecure: true },
      { name: 'AWS_SECRET_ACCESS_KEY', isSecure: true },
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
    ];

    for (const params of parametersToLoad) {
      // if not in production and the variable is set in local .env file, load it from there
      if (!isProduction() && process.env[params.name]) {
        this.logger.debug(`Loading ${params.name} from local .env file`);
        EnvConfigService.appConfig[params.name] = process.env[params.name];
        continue;
      }

      this.logger.debug(`Loading ${params.name} from SSM`);
      await this.ssmCLient
        .getParameter({
          Name: `/${this.currentEnv}/q1/config/${params.name}`,
          WithDecryption: params.isSecure,
        })
        .promise()
        .then((resp) => {
          this.logger.debug(
            `Loaded ${params.name} from SSM successfully with value: ${resp.Parameter.Value}`,
          );
          const Parameter = resp.Parameter;
          EnvConfigService.appConfig[params.name] = Parameter.Value;
        })
        .catch((err) => {
          this.logger.error(
            `Error loading variable ${params.name} from SSM, with error: ${err}`,
          );
          throw new Error(
            `Error loading variable ${params.name} from SSM with error: ${err}`,
          );
        });
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
      // Throw an error for critical missing configurations to halt the application startup.
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
  if (process.env.NODE_ENV === 'dev') return false;
  return true;
};
