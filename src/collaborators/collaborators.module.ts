import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { InstitutesModule } from '../institutes/institutes.module';
import { institutesProviders } from '../institutes/providers/institutes.providers';
import { InstitutesService } from '../institutes/services/institutes.service';
import { ProjectModule } from '../projects/projects.module';
import { ProjectsService } from '../projects/services/projects.service';
import { UtilService } from '../util/services/util.service';
import { UtilModule } from '../util/util.module';
import { DocumentsModule } from './../documents/documents.module';
import { DocumentsService } from './../documents/services/documents.service';
import { FileManagementModule } from './../filemanagement/filemanagement.module';
import { FileManagementService } from '../filemanagement/services/filemanagement.service';
import { LocationModule } from './../location/location.module';
import { LocationService } from './../location/service/location.service';
import { BenefitsController } from './controllers/benefits.controller';
import { CollaboratorsController } from './controllers/collaborators.controller';
import { EmploymentRelationshipController } from './controllers/employment-relationship.controller';
import { benefitsTypeProviders } from './providers/benefit-type.providers';
import { benefitsProviders } from './providers/benefit.providers';
import { collaboratorMonthlyReportProviders } from './providers/collaborator-monthly-report.providers';
import { collaboratorsProviders } from './providers/collaborators.providers';
import { employmentRelationshipProviders } from './providers/employment-relationship.providers';
import { irrfRuleProviders } from './providers/irrf-rule.providers';
import { notedDateProviders } from './providers/noted-date.providers';
import { payrollProviders } from './providers/payroll.providers';
import { BenefitsService } from './services/benefits.service';
import { CollaboratorsService } from './services/collaborators.service';
import { EmploymentRelationshipService } from './services/employment-relationship.service';
import { NotedDateService } from './services/noted-date.service';
import { PayrollService } from './services/payroll.service';
import { benefitsModelProviders } from './providers/benefit-model.providers';
import { BudgetCategoryService } from './../suppliers/services/budgetCategory.service';
import { budgetCategoryProviders } from './../suppliers/providers/budget-category.providers';
import { paymentProviders } from './providers/payment.providers';
import { paymentComponentProviders } from './providers/payment-component.providers';
import { ProjectMemberService } from '../projects/services/project-member.service';

@Module({
  imports: [DatabaseModule, DocumentsModule, FileManagementModule, ProjectModule,
    forwardRef(() => InstitutesModule), UtilModule, LocationModule, UtilModule],
  providers: [
    ...collaboratorsProviders,
    ...employmentRelationshipProviders,
    ...benefitsProviders,
    ...benefitsModelProviders,
    ...benefitsTypeProviders,
    ...collaboratorMonthlyReportProviders,
    ...payrollProviders,
    ...paymentProviders,
    ...paymentComponentProviders,
    ...institutesProviders,
    ...notedDateProviders,
    ...irrfRuleProviders,
    ...budgetCategoryProviders,
    CollaboratorsService,
    BenefitsService,
    EmploymentRelationshipService,
    LocationService,
    FileManagementService,
    DocumentsService,
    InstitutesService,
    PayrollService,
    UtilService,
    ProjectsService,
    ProjectMemberService,
    NotedDateService,
    BudgetCategoryService
  ],
  controllers: [CollaboratorsController,
    BenefitsController, EmploymentRelationshipController],
  exports: [...collaboratorsProviders,
  ...employmentRelationshipProviders,
  ...benefitsProviders,
  ...benefitsModelProviders,
  ...benefitsTypeProviders,
  ...collaboratorMonthlyReportProviders,
  ...payrollProviders,
  ...paymentProviders,
  ...paymentComponentProviders,
  ...institutesProviders,
  ...notedDateProviders,
  ...irrfRuleProviders,
  ...budgetCategoryProviders,
    CollaboratorsService,
    BenefitsService,
    EmploymentRelationshipService,
    LocationService,
    FileManagementService,
    DocumentsService,
    ProjectsService,
    ProjectMemberService,
    UtilService,
    InstitutesService,
    PayrollService,
    NotedDateService,
    BudgetCategoryService]
})
export class CollaboratorsModule { }