import { Connection } from 'typeorm';
import { Activite } from '../entity/Activite.entity';


export const activiteProviders = [
  {
    provide: 'ACTIVITE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Activite),
    inject: ['DATABASE_CONNECTION'],
  },
];