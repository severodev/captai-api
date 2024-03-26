import { Connection } from 'typeorm';
import { edital } from '../entity/edital.entity';


export const editaisProviders = [
  {
    provide: 'EDITAIS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(edital),
    inject: ['DATABASE_CONNECTION'],
  },
];