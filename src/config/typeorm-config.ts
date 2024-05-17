import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { EnvConfigService, isProduction } from './env-config';
import { DataSourceOptions } from 'typeorm';

export const getTypeOrmConfig = (): TypeOrmModuleOptions => {
  let typeOrmConfig: TypeOrmModuleOptions = {
    type: 'postgres',
    host: EnvConfigService.get('DB_HOST'),
    port: Number(EnvConfigService.get('DB_PORT')),
    username: EnvConfigService.get('DB_USER'),
    password: EnvConfigService.get('DB_PASSWORD'),
    database: EnvConfigService.get('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: isProduction() ? false : true,
    logging: true,
  };

  if (isProduction()) {
    console.log('ENV not set. Defaulting to prod env');
    typeOrmConfig = {
      ...typeOrmConfig,
      ssl: { rejectUnauthorized: false },
    };
  }

  return typeOrmConfig;
};

export const convertToDataSourceOptions = (
  config: TypeOrmModuleOptions,
): DataSourceOptions => {
  return {
    ...config,
    // Add any additional properties or conversions if needed
  } as DataSourceOptions;
};
