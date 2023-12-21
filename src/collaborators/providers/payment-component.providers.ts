import { Connection } from 'typeorm';
import { PaymentComponent } from '../entity/payment-component.entity';

export const paymentComponentProviders = [
  {
    provide: 'PAYMENT_COMPONENT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(PaymentComponent),
    inject: ['DATABASE_CONNECTION'],
  },
];