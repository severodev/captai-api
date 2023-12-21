import { Connection } from 'typeorm';
import { PasswordRecovery } from '../entity/password-recovery.entity';

export const passwordRecoveryProviders = [
  {
    provide: 'PASSWORD_RECOVERY_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(PasswordRecovery),
    inject: ['DATABASE_CONNECTION'],
  },
];