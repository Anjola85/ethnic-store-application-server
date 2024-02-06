/**
 * @see
 * This service is responsible for loading the environment variables from SSM
 * and making them available to the application
 *
 * Improvement: default loading of variables to local .env file if not on AWS SSM
 *
 */
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Injectable()
export class EnvConfigService implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    this.logger.log('Initializing EnvConfigService...');
    await this.loadConfig();
  }

  private readonly logger = new Logger(EnvConfigService.name);
  private readonly appConfig: Record<string, string> = {};
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
        region: process.env.AWS_REGION,
      });
    }

    this.currentEnv = isProd ? '/prod' : '/dev';
  }

  /**
   * Loads the environment variables from SSM
   */
  public async loadConfig(): Promise<void> {
    console.log('Loading config from SSM');
    const parametersToLoad = [
      { name: 'AWS_ACCESS_KEY', isSecure: true },
      { name: 'AWS_SECRET_ACCESS_KEY', isSecure: true },
      { name: 'SECRET_KEY', isSecure: true },
      { name: 'AWS_REGION', isSecure: false },
      { name: 'AWS_BUCKET_NAME', isSecure: false },
      { name: 'AWS_BUCKET_REGION', isSecure: false },
      { name: 'DB_PORT', isSecure: false },
      { name: 'AWS_KMS_KEY_ID', isSecure: true },
      { name: 'DB_NAME', isSecure: true },
      { name: 'DB_HOST', isSecure: true },
      { name: 'DB_USER', isSecure: true },
      { name: 'DB_PASSWORD', isSecure: true },
      { name: 'GCP_GEOCODING_API_KEY', isSecure: true },
      { name: 'TWILIO_ACCOUNT_SID', isSecure: true },
      { name: 'TWILIO_AUTH_TOKEN', isSecure: true },
      { name: 'TWILIO_PHONE_NUMBER', isSecure: true },
      { name: 'SENDGRID_API_KEY', isSecure: true },
      { name: 'WAITLIST_ID', isSecure: true },
    ];

    this.logger.debug('Loading environment variables from SSM');
    // console.log('Entering for loop...');
    for (const params of parametersToLoad) {
      // console.log('talking to aws');
      // TODO: change to use currentEnv
      const resp = await this.ssmCLient
        .getParameter({
          Name: `/prod/q1/config/${params.name}`,
          WithDecryption: params.isSecure,
        })
        .promise()
        .then((resp) => {
          this.logger.debug(`Loaded ${params.name} from SSM successfully`);
          const Parameter = resp.Parameter;
          this.appConfig[params.name] = Parameter.Value;
        })
        .catch((err) => {
          this.logger.error(
            `Error loading variable ${params.name} from SSM, with error: ${err}`,
          );
        });
    }

    // TODO: keep retying failed variables that didnt load in the background
  }

  get(key: string): string {
    const value = this.appConfig[key];

    // TODO: copy all SSM variables to env, make it accessible also from env
    // if (!value) {
    //   this.logger.debug(
    //     `Config not found for key: ${key} in SSM, using env variable instead`,
    //   );
    //   return process.env[key];
    // }

    console.log('value: ', value);
    return value;
  }

  public validateConfig() {
    console.log('Validating config environment variables');
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
      (config) => !this.appConfig[config],
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
  console.log(
    'Checking if prod environment...\nNODE_ENV: ',
    process.env.NODE_ENV,
  );
  if (process.env.NODE_ENV === 'dev') return false;
  return true;
};
