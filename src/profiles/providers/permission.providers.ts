import { Connection } from 'typeorm';
import { Permission } from '../entity/permission.entity';

export const permissionProviders = [
  {
    provide: 'PERMISSION_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Permission),
    inject: ['DATABASE_CONNECTION'],
  },
];