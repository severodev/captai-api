import { Module } from '@nestjs/common';
import { DatabaseModule } from './../database/database.module';
import { FileManagementModule } from './../filemanagement/filemanagement.module';
import { DocumentsController } from './controllers/documents.controller';
import { documentCategoryProviders } from './providers/document-category.providers';
import { documentTypeProviders } from './providers/document-type.providers';
import { documentsProviders } from './providers/documents.providers';
import { fileTypeProviders } from './providers/file-type.providers';
import { DocumentCategoryService } from './services/document-category.service';
import { DocumentTypeService } from './services/document-type.service';
import { DocumentsService } from './services/documents.service';
import { FileTypeService } from './services/file-type.service';

@Module({
  imports: [DatabaseModule, FileManagementModule],
  providers: [...documentsProviders,
  ...documentTypeProviders,
  ...documentCategoryProviders,
  ...fileTypeProviders,
    DocumentsService, FileTypeService, DocumentCategoryService, DocumentTypeService],
  exports: [...documentsProviders,
    ...documentTypeProviders,
    ...documentCategoryProviders,
    ...fileTypeProviders,
    DocumentsService,FileTypeService, DocumentCategoryService, DocumentTypeService],
  controllers: [DocumentsController]
})
export class DocumentsModule { }
