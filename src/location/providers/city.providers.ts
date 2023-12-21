import { Connection } from 'typeorm';
import { City } from '../entity/city.entity';

export const cityProviders = [
  {
    provide: 'CITY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(City),
    inject: ['DATABASE_CONNECTION'],
  },
];