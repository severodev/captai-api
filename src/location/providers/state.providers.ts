import { Connection } from 'typeorm';
import { State } from '../entity/state.entity';

export const stateProviders = [
  {
    provide: 'STATE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(State),
    inject: ['DATABASE_CONNECTION'],
  },
];