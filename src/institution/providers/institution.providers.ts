import { Connection } from 'typeorm';
import { Institution } from '../entity/institution.entity';

export const institutionProviders = [
  {
    provide: 'INSTITUTION_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Institution),
    inject: ['DATABASE_CONNECTION'],
  },
];