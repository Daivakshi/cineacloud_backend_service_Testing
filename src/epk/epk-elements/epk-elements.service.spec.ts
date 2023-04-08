import { Test, TestingModule } from '@nestjs/testing';
import { EpkElementsService } from './epk-elements.service';

describe('EpkElementsService', () => {
  let service: EpkElementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EpkElementsService],
    }).compile();

    service = module.get<EpkElementsService>(EpkElementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
