import { Test, TestingModule } from '@nestjs/testing';
import { WorkplanController } from './workplan.controller';

describe('Workplan Controller', () => {
  let controller: WorkplanController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorkplanController],
    }).compile();

    controller = module.get<WorkplanController>(WorkplanController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
