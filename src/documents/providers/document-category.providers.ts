import { Connection } from 'typeorm';
import { DocumentCategory } from '../entity/document-category.entity';

export const documentCategoryProviders = [
  {
    provide: 'DOCUMENT_CATEGORY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(DocumentCategory),
    inject: ['DATABASE_CONNECTION'],
  },
];