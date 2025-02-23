import { Test, TestingModule } from '@nestjs/testing';
import { BaseExchangeService } from './base-exchange.service';

// 创建一个测试用的具体实现类
class TestExchangeService extends BaseExchangeService {
  constructor() {
    super('gate', 'test-api-key', 'test-secret');
  }
}

describe('BaseExchangeService', () => {
  let service: TestExchangeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TestExchangeService],
    }).compile();

    service = module.get<TestExchangeService>(TestExchangeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
}); 