import { Connection } from 'typeorm';
import { Bank } from '../entity/bank.entity';

export const bankProviders = [
  {
    provide: 'BANK_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Bank),
    inject: ['DATABASE_CONNECTION'],
  },
];