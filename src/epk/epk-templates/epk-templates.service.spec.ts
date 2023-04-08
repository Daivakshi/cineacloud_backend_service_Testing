import { Test, TestingModule } from '@nestjs/testing';
import { EpkTemplatesService } from './epk-templates.service';

describe('EpkTemplatesService', () => {
  let service: EpkTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpkTemplatesService],
    }).compile();

    service = module.get<EpkTemplatesService>(EpkTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
