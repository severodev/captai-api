import { Connection } from 'typeorm';
import { FileType } from '../entity/file-type.entity';

export const fileTypeProviders = [
  {
    provide: 'FILE_TYPE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(FileType),
    inject: ['DATABASE_CONNECTION'],
  },
];