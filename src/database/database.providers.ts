import { DataSource } from 'typeorm';
import * as dotenv from "dotenv";

dotenv.config({ path: '.env' });

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: async () => {
      const dataSource = new DataSource({
        type: 'postgres',
        host: process.env.DATABASE_HOST,
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        username: process.env.DATABASE_USERNAME,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_DBNAME,
        ssl: true,
        entities: [
            __dirname + '/../**/*.entity{.ts,.js}',
        ],
        synchronize: true,
      });

      return dataSource.initialize();
    },
  },
];

// export const databaseProviders = [
//   {
//     provide: 'DATABASE_CONNECTION',
//     useFactory: async () => await createConnection({
//       type: 'postgres',
//       host: process.env.DATABASE_HOST,
//       port: parseInt(process.env.DATABASE_PORT) || 5432,
//       username: process.env.DATABASE_USERNAME,
//       password: process.env.DATABASE_PASSWORD,
//       database: process.env.DATABASE_DBNAME,
//       entities: [
//         __dirname + '/../**/*.entity{.ts,.js}',
//       ],
//       synchronize: true,
//       migrations: ['migration/*.js'],
//       cli: {
//         'migrationsDir': 'migration'
//       },
//       // logging: ["query", "error"]
//     }),
//   },
// ];