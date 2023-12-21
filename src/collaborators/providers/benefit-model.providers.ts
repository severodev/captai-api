import { Connection } from 'typeorm';
import { BenefitModel } from '../entity/benefit-model.entity';

export const benefitsModelProviders = [
  {
    provide: 'BENEFITS_MODEL_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(BenefitModel),
    inject: ['DATABASE_CONNECTION'],
  },
];