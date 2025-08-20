import { Test, TestingModule } from '@nestjs/testing';
import { RequisiteService } from './requisite.service';

describe('RequisiteService', () => {
  let service: RequisiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RequisiteService],
    }).compile();

    service = module.get<RequisiteService>(RequisiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
