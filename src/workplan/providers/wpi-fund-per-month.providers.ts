import { Connection } from 'typeorm';
import { WPIFundPerMonth } from '../entity/wpi-fund-per-month.entity';

export const wpiFundPerMonthProviders = [
  {
    provide: 'WPI_FUND_PER_MONTH_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(WPIFundPerMonth),
    inject: ['DATABASE_CONNECTION'],
  },
];