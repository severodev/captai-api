import { Connection } from 'typeorm';
import { DocumentType } from "../entity/document-type.entity";

export const documentTypeProviders = [
  {
    provide: 'DOCUMENT_TYPE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(DocumentType),
    inject: ['DATABASE_CONNECTION'],
  },
];