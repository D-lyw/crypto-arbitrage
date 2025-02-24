import { Test, TestingModule } from '@nestjs/testing';
import { GateService } from './gate.service';

describe('GateService', () => {
  let service: GateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GateService],
    }).compile();

    service = module.get<GateService>(GateService);
  });

  describe('getPrice', () => {
    jest.setTimeout(15000);

    it('should get price for SEAL/USDT', async () => {
      try {
        const price = await service.getPrice('SEAL/USDT');
        console.log('SEAL/USDT 价格:', price);
        expect(Number(price)).toBeGreaterThan(0);
      } catch (error) {
        console.error('获取价格失败:', error);
        throw error;
      }
    });

    it('should get price for CKB/USDT', async () => {
      try {
        const price = await service.getPrice('CKB/USDT');
        console.log('CKB/USDT 价格:', price);
        expect(Number(price)).toBeGreaterThan(0);
      } catch (error) {
        console.error('获取价格失败:', error);
        throw error;
      }
    });
  });

  describe('getBalance', () => {
    it('should get balance for USDT', async () => {
      try {
        const balance = await service.getBalance({ currency: 'USDT' });
        console.log('USDT 余额:', balance);
        expect(balance).toBeDefined();
      } catch (error) {
        console.error('获取余额失败:', error);
        throw error;
      }
    });
  });

  describe('createOrder', () => {
    it('should create a limit sell order', async () => {
      try {
        const price = await service.getPrice('SEAL/USDT');
        if (!price) throw new Error('无法获取价格');

        const sellPrice = Number(price) * 2;

        const order = await service.createOrder({
          symbol: 'SEAL/USDT',
          type: 'limit',
          side: 'sell',
          amount: 30,
          price: sellPrice,
        });

        console.log('创建的订单:', order);
        expect(order.id).toBeDefined();

        if (order.id) {
          await service.cancelOrder(order.id, 'SEAL/USDT');
          console.log('测试订单已取消');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        throw error;
      }
    });
  });
}); 