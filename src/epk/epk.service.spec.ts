import { Test, TestingModule } from '@nestjs/testing';
import { EpkService } from './epk.service';

describe('EpkService', () => {
  let service: EpkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpkService],
    }).compile();

    service = module.get<EpkService>(EpkService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
