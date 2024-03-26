import { Test, TestingModule } from '@nestjs/testing';
import { EditalsService } from './edital.service';

describe('EditalsService', () => {
  let service: EditalsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EditalsService],
    }).compile();

    service = module.get<EditalsService>(EditalsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});