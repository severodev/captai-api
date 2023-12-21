import { Connection } from 'typeorm';
import { Document } from '../entity/document.entity';

export const documentsProviders = [
  {
    provide: 'DOCUMENT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Document),
    inject: ['DATABASE_CONNECTION'],
  },
];