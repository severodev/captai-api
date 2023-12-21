import { forwardRef, Module } from '@nestjs/common';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { payrollProviders } from '../collaborators/providers/payroll.providers';
import { PayrollService } from '../collaborators/services/payroll.service';
import { DocumentsModule } from '../documents/documents.module';
import { FileManagementService } from '../filemanagement/services/filemanagement.service';
import { LocationService } from '../location/service/location.service';
import { ProjectModule } from '../projects/projects.module';
import { projectsProviders } from '../projects/providers/projects.providers';
import { ProjectsService } from '../projects/services/projects.service';
import { UtilModule } from '../util/util.module';
import { DatabaseModule } from './../database/database.module';
import { LocationModule } from './../location/location.module';
import { bankProviders } from './../projects/providers/bank.providers';
import { BankService } from './../projects/services/bank.service';
import { BudgetCategoryController } from './controllers/budget-category.controller';
import { ExpensesController } from './controllers/expenses.controller';
import { SuppliersController } from './controllers/suppliers.controller';
import { budgetCategoryProviders } from './providers/budget-category.providers';
import { expensesProviders } from './providers/expenses.providers';
import { suppliersProviders } from './providers/suppliers.providers';
import { BudgetCategoryService } from './services/budgetCategory.service';
import { ExpenseService } from './services/expense.service';
import { SuppliersService } from './services/suppliers.service';

@Module({
  imports: [DatabaseModule, LocationModule, DocumentsModule,
    forwardRef(() => CollaboratorsModule), forwardRef(() => ProjectModule),
    UtilModule],
  providers: [
    ...suppliersProviders,
    ...budgetCategoryProviders,
    ...bankProviders,
    ...expensesProviders,
    ...payrollProviders,    
    ...projectsProviders,
    SuppliersService,
    BudgetCategoryService,
    BankService,
    ExpenseService,
    FileManagementService,
    ProjectsService,
    PayrollService,
    LocationService,
    ProjectsService
  ],
  controllers: [SuppliersController,
    BudgetCategoryController,
    ExpensesController],
  exports: [...suppliersProviders,
  ...budgetCategoryProviders,
  ...expensesProviders,
  // ...cityProviders,
  // ...stateProviders,
    // LocationService,
    BudgetCategoryService,
    BankService,
    ExpenseService,
    ProjectsService,
    FileManagementService,
    PayrollService,
    LocationService,
    SuppliersService
  ]
})
export class SuppliersModule { }
