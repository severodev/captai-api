import { Connection } from 'typeorm';
import { Supplier } from '../entity/supplier.entity';

export const suppliersProviders = [
  {
    provide: 'SUPPLIERS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Supplier),
    inject: ['DATABASE_CONNECTION'],
  },
];