import { Connection } from 'typeorm';
import { Validity } from '../entity/validity.entity';

export const validityProviders = [
  {
    provide: 'VALIDITY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Validity),
    inject: ['DATABASE_CONNECTION'],
  },
];