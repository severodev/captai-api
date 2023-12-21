import { Connection } from 'typeorm';
import { BenefitType } from '../entity/benefit-type.entity';
import { Benefit } from '../entity/benefit.entity';

export const benefitsTypeProviders = [
  {
    provide: 'BENEFITS_TYPE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(BenefitType),
    inject: ['DATABASE_CONNECTION'],
  },
];