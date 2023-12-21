import { Connection } from 'typeorm';
import { ApplicationSettings } from '../entity/api-settings.entity';

export const settingsProviders = [
  {
    provide: 'SETTINGS_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ApplicationSettings),
    inject: ['DATABASE_CONNECTION'],
  },
];