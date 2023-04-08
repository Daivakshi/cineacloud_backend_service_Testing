import { Test, TestingModule } from '@nestjs/testing';
import { PropsService } from './props.service';

describe('PropsService', () => {
  let service: PropsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PropsService],
    }).compile();

    service = module.get<PropsService>(PropsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
