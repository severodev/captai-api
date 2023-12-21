import { Connection } from 'typeorm';
import { PayRoll } from '../entity/payroll.entity';

export const payrollProviders = [
  {
    provide: 'PAYROLL_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(PayRoll),
    inject: ['DATABASE_CONNECTION'],
  },
];