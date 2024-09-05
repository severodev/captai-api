import { Connection } from 'typeorm';
import { Edital } from '../entity/edital.entity';


export const editaisProviders = [
  {
    provide: 'EDITAIS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Edital),
    inject: ['DATABASE_CONNECTION'],
  },
];