import { Connection } from 'typeorm';
import { Collaborator } from '../entity/collaborator.entity';

export const collaboratorsProviders = [
  {
    provide: 'COLLABORATORS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Collaborator),
    inject: ['DATABASE_CONNECTION'],
  },
];