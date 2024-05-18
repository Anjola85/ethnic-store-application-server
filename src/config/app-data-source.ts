import { DataSource } from 'typeorm';
import { EnvConfigService, isProduction } from './env-config';
import { Client } from 'pg';
import { convertToDataSourceOptions, getTypeOrmConfig } from './typeorm-config';

const NUMBER_OF_RETRIES = 5;

export const AppDataSource = new DataSource(
  convertToDataSourceOptions(getTypeOrmConfig()),
);

export const initializeAppDataSource = async (
  retries = NUMBER_OF_RETRIES,
): Promise<void> => {
  await new EnvConfigService().loadConfig();

  const dbConfig = {
    host: EnvConfigService.get('DB_HOST'),
    port: Number(EnvConfigService.get('DB_PORT')),
    user: EnvConfigService.get('DB_USER'),
    password: EnvConfigService.get('DB_PASSWORD'),
    database: EnvConfigService.get('DB_NAME'),
  };

  // let ensureDatabaseExists: () => Promise<void> = async () => {};
  // if (isProduction()) {
  //   ensureDatabaseExists = async () => {
  //     console.log('Ensuring database exists');
  //     const client = new Client({
  //       ...dbConfig,
  //       database: EnvConfigService.get('DB_HOST'),
  //     });

  //     try {
  //       await client.connect();
  //       const res = await client.query(
  //         `SELECT 1 FROM pg_database WHERE datname = $1`,
  //         [dbConfig.database],
  //       );
  //       if (res.rowCount === 0) {
  //         await client.query(`CREATE DATABASE "${dbConfig.database}"`);
  //         console.log(`Database "${dbConfig.database}" created successfully`);
  //       } else {
  //         console.log(`Database "${dbConfig.database}" already exists`);
  //       }
  //     } finally {
  //       await client.end();
  //     }
  //   };
  // }

  // await ensureDatabaseExists();

  AppDataSource.setOptions({
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
  });

  const initializeDataSource = async (retries: number): Promise<void> => {
    try {
      await AppDataSource.initialize();
      console.log('Database connection established');
    } catch (error) {
      if (retries === 0) {
        console.error(
          'Failed to connect to the database after multiple attempts',
          error,
        );
        throw error;
      } else {
        console.warn(`Retrying database connection, attempts left: ${retries}`);
        setTimeout(() => initializeDataSource(retries - 1), 5000);
      }
    }
  };

  await initializeDataSource(retries);
};
