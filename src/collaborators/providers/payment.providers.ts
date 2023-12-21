import { Connection } from 'typeorm';
import { Payment } from '../entity/payment.entity';

export const paymentProviders = [
  {
    provide: 'PAYMENT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(Payment),
    inject: ['DATABASE_CONNECTION'],
  },
];