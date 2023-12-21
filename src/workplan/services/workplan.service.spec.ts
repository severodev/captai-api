import { Test, TestingModule } from '@nestjs/testing';
import { WorkplanService } from './workplan.service';

describe('WorkplanService', () => {
  let service: WorkplanService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WorkplanService],
    }).compile();

    service = module.get<WorkplanService>(WorkplanService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
