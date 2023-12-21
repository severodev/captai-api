import { Connection } from 'typeorm';
import { AuditEntry } from '../entity/audit-entry.entity';

export const auditProviders = [
  {
    provide: 'AUDIT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(AuditEntry),
    inject: ['DATABASE_CONNECTION'],
  },
];