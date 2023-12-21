import { Connection } from 'typeorm';
import { FirstAccess } from '../entity/first-access.entity';

export const firstAccessProviders = [
  {
    provide: 'FIRST_ACCESS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(FirstAccess),
    inject: ['DATABASE_CONNECTION'],
  },
];