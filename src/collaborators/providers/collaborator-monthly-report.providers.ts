import { Connection } from 'typeorm';
import { CollaboratorMonthlyReport } from '../entity/collaborator-monthly-report.entity';

export const collaboratorMonthlyReportProviders = [
  {
    provide: 'COLLABORATORS_MONTHLY_REPORT_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(CollaboratorMonthlyReport),
    inject: ['DATABASE_CONNECTION'],
  },
];