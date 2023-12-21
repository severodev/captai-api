import { Connection } from 'typeorm';
import { NotedDate } from '../entity/noted-date.entity';

export const notedDateProviders = [
  {
    provide: 'NOTED_DATE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(NotedDate),
    inject: ['DATABASE_CONNECTION'],
  },
];