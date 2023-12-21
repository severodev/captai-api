import { Connection } from 'typeorm';
import { Expense } from '../entity/expense.entity';

export const expensesProviders = [
  {
    provide: 'EXPENSES_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Expense),
    inject: ['DATABASE_CONNECTION'],
  },
];