import { forwardRef, Module } from '@nestjs/common';
import { FileManagementModule } from './../filemanagement/filemanagement.module';
import { DatabaseModule } from '../database/database.module';
import { CollaboratorsModule } from './../collaborators/collaborators.module';
import { DocumentsModule } from './../documents/documents.module';
import { BankController } from './controllers/bank.controller';
import { ProjectsController } from './controllers/projects.controller';
import { bankProviders } from './providers/bank.providers';
import { projectsProviders } from './providers/projects.providers';
import { BankService } from './services/bank.service';
import { ProjectsService } from './services/projects.service';
import { InstitutesModule } from './../institutes/institutes.module';
import { projectMemberProviders } from './providers/project-member.provider';
import { ProjectMemberService } from './services/project-member.service';
import { ExpenseService } from '../suppliers/services/expense.service';
import { WorkplanService } from '../workplan/services/workplan.service';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { WorkplanModule } from '../workplan/workplan.module';
import { expensesProviders } from '../suppliers/providers/expenses.providers';
import { workplanItemProviders } from '../workplan/providers/workplan-item.providers';
import { CollaboratorsService } from '../collaborators/services/collaborators.service';
import { validityProviders } from '../workplan/providers/validity.providers';

@Module({
  imports: [DatabaseModule, DocumentsModule, 
    forwardRef(() => CollaboratorsModule), FileManagementModule,
    forwardRef(() => SuppliersModule), WorkplanModule,
    forwardRef(() => InstitutesModule)], 
  providers: [
    ...projectsProviders,
    ...bankProviders,
    ...projectMemberProviders,
    ...expensesProviders,
    ...workplanItemProviders,
    ...validityProviders,
    ProjectsService,
    BankService,
    ProjectMemberService,
    ExpenseService,
    WorkplanService,
    CollaboratorsService
  ],
  controllers: [ProjectsController, BankController],
  exports: [...projectsProviders, ...bankProviders, ...projectMemberProviders, ...expensesProviders, ...validityProviders,
    ...workplanItemProviders, ProjectMemberService, ProjectsService, BankService, ExpenseService, WorkplanService]
})
export class ProjectModule { }
