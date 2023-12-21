import { Module } from '@nestjs/common';
import { FileManagementController } from './controllers/filemanagement.controller';
import { FileManagementService } from './services/filemanagement.service';

@Module({
  controllers: [FileManagementController],
  exports: [FileManagementService],
  providers: [FileManagementService]
})
export class FileManagementModule {}
