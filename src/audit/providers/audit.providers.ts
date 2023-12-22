import { DataSource } from 'typeorm';
import { AuditEntry } from '../entity/audit-entry.entity';

export const auditProviders = [
  {
    provide: 'AUDIT_REPOSITORY',
    useFactory: (dataSource: DataSource) => dataSource.getRepository(AuditEntry),
    inject: ['DATABASE_CONNECTION'],
  },
];