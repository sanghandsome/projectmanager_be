import { Test, TestingModule } from '@nestjs/testing';
import { CfgStatementController } from './cfg-statement.controller';

describe('CfgStatementController', () => {
  let controller: CfgStatementController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CfgStatementController],
    }).compile();

    controller = module.get<CfgStatementController>(CfgStatementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
