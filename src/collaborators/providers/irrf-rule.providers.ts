import { Connection } from 'typeorm';
import { IRRFRule } from '../entity/irrf-rule.entity';

export const irrfRuleProviders = [
  {
    provide: 'IRRF_RULE_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(IRRFRule),
    inject: ['DATABASE_CONNECTION'],
  },
];