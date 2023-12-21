import { Connection } from 'typeorm';
import { Benefit } from '../entity/benefit.entity';

export const benefitsProviders = [
  {
    provide: 'BENEFITS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Benefit),
    inject: ['DATABASE_CONNECTION'],
  },
];