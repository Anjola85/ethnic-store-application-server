import { DataSource } from 'typeorm';
import { EnvConfigService } from './env-config';
import { Client } from 'pg';

const NUMBER_OF_RETRIES = 5;

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: EnvConfigService.get('DB_HOST'),
  port: Number(EnvConfigService.get('DB_PORT')),
  username: EnvConfigService.get('DB_USER'),
  password: EnvConfigService.get('DB_PASSWORD'),
  database: EnvConfigService.get('DB_NAME'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: process.env.NODE_ENV === 'dev',
  logging: true,
  ssl: process.env.NODE_ENV !== 'dev' ? { rejectUnauthorized: false } : false,
});

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

  const ensureDatabaseExists = async () => {
    console.log('Ensuring database exists');
    const client = new Client({
      ...dbConfig,
      database: 'postgres',
    });

    try {
      await client.connect();
      const res = await client.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbConfig.database],
      );
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "${dbConfig.database}"`);
        console.log(`Database "${dbConfig.database}" created successfully`);
      } else {
        console.log(`Database "${dbConfig.database}" already exists`);
      }
    } finally {
      await client.end();
    }
  };

  await ensureDatabaseExists();

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

// import { DataSource } from 'typeorm';
// import { EnvConfigService } from './env-config';

// await new EnvConfigService().loadConfig();

// const dbConfig = {
//   host: EnvConfigService.get('DB_HOST'),
//   port: Number(EnvConfigService.get('DB_PORT')),
//   user: EnvConfigService.get('DB_USER'),
//   password: EnvConfigService.get('DB_PASSWORD'),
//   database: EnvConfigService.get('DB_NAME'),
// };

// export const AppDataSource = new DataSource({
//   type: 'postgres',
//   host: EnvConfigService.get('DB_HOST'),
//   port: Number(EnvConfigService.get('DB_PORT')),
//   username: EnvConfigService.get('DB_USER'),
//   password: EnvConfigService.get('DB_PASSWORD'),
//   database: EnvConfigService.get('DB_NAME'),
//   entities: [__dirname + '/../**/*.entity{.ts,.js}'],
//   synchronize: process.env.NODE_ENV === 'dev',
//   logging: true,
//   ssl: process.env.NODE_ENV === 'dev' ? { rejectUnauthorized: false } : false,
// });

// const initializeDataSource = async (retries = 5) => {
//   try {
//     await AppDataSource.initialize();
//     console.log('Database connection established');
//   } catch (error) {
//     if (retries === 0) {
//       console.error(
//         'Failed to connect to the database after multiple attempts',
//         error,
//       );
//       throw error;
//     } else {
//       console.log(`Env config: ${EnvConfigService.get('DB_NAME')}`);
//       console.warn(`Retrying database connection, attempts left: ${retries}`);
//       setTimeout(() => initializeDataSource(retries - 1), 5000);
//     }
//   }
// };

// initializeDataSource();
