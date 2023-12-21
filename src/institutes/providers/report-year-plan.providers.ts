import { Connection } from 'typeorm';
import { ReportYearPlan } from '../entity/report-year-plan.entity';

export const institutesMonthlyReportPlanProviders = [
  {
    provide: 'REPORT_YEAR_PLAN_REPOSITORY',
    useFactory: (connection: Connection) => connection.getRepository(ReportYearPlan),
    inject: ['DATABASE_CONNECTION'],
  },
];