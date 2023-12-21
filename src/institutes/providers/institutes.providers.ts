import { Connection } from 'typeorm';
import { Institute } from '../entity/institute.entity';

export const institutesProviders = [
  {
    provide: 'INSTITUTE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Institute),
    inject: ['DATABASE_CONNECTION'],
  },
];