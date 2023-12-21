import { Connection } from 'typeorm';
import { ExpenseInstallment } from '../entity/expense-installment.entity';

export const expensesInstallmentProviders = [
  {
    provide: 'EXPENSES_INSTALLMENT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ExpenseInstallment),
    inject: ['DATABASE_CONNECTION'],
  },
];