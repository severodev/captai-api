import { Connection } from 'typeorm';
import { Loan } from '../entities/loan.entity';


export const loanProviders = [
  {
    provide: 'LOAN_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Loan),
    inject: ['DATABASE_CONNECTION'],
  },
];