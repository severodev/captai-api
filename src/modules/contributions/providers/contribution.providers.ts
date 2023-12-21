import { Connection } from 'typeorm';
import { Contribution } from '../entities/contribution.entity';

export const contributionProviders = [
  {
    provide: 'CONTRIBUTION_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Contribution),
    inject: ['DATABASE_CONNECTION'],
  },
];