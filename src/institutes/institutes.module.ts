import { forwardRef, HttpModule, Module } from '@nestjs/common';
import { CollaboratorsModule } from '../collaborators/collaborators.module';
import { DatabaseModule } from '../database/database.module';
import { DocumentsModule } from '../documents/documents.module';
import { DocumentTypeService } from '../documents/services/document-type.service';
import { FileManagementModule } from '../filemanagement/filemanagement.module';
import { FileManagementService } from '../filemanagement/services/filemanagement.service';
import { ProjectModule } from '../projects/projects.module';
import { ProjectsService } from '../projects/services/projects.service';
import { InstitutesController } from './controllers/institutes.controller';
import { institutesProviders } from './providers/institutes.providers';
import { institutesMonthlyReportPlanProviders } from './providers/report-year-plan.providers';
import { InstituteReportService } from './services/institute-report.service';
import { InstitutesService } from './services/institutes.service';

@Module({
    imports: [DatabaseModule, forwardRef(() => CollaboratorsModule), DocumentsModule, forwardRef(() => ProjectModule), FileManagementModule, HttpModule],
    providers: [
        ...institutesProviders,
        ...institutesMonthlyReportPlanProviders,
        InstitutesService,
        InstituteReportService,
        DocumentTypeService,
        FileManagementService,
        ProjectsService
    ],
    exports: [...institutesProviders, InstitutesService, DocumentTypeService , FileManagementService, ProjectsService, InstituteReportService],
    controllers: [InstitutesController]
})
export class InstitutesModule {}
