import { Test, TestingModule } from '@nestjs/testing';
import { CfgStatementService } from './cfg-statement.service';

describe('CfgStatementService', () => {
  let service: CfgStatementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CfgStatementService],
    }).compile();

    service = module.get<CfgStatementService>(CfgStatementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
