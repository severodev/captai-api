import { Test, TestingModule } from '@nestjs/testing';
import { FileManagementService } from './filemanagement.service';

describe('FileuploadService', () => {
  let service: FileManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileManagementService],
    }).compile();

    service = module.get<FileManagementService>(FileManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
