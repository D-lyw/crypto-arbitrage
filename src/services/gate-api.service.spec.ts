import { Test, TestingModule } from '@nestjs/testing';
import { GateApiService } from './gate-api.service';
import { Order } from 'gate-api';

describe('GateApiService', () => {
  let service: GateApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GateApiService],
    }).compile();

    service = module.get(GateApiService, { strict: false });
  });

  describe('getPrice', () => {
    it('should get price for a symbol', async () => {
      try {
        const price = await service.getPrice('SEAL_USDT');
        expect(price).toBeGreaterThan(0);
      } catch (error) {
        console.error('获取价格失败:', error);
        throw error;
      }
    });

    it('should handle invalid symbol', async () => {
      await expect(service.getPrice('INVALID_SYMBOL'))
        .rejects
        .toThrow();
    });
  });

  describe('getBalance', () => {
    it('should get balance for USDT', async () => {
      try {
        const balance = await service.getBalance('USDT');
        console.log('USDT 余额:', balance);
        expect(balance).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.error('获取余额失败:', error);
        throw error;
      }
    });

    it('should get balance for SEAL', async () => {
      try {
        const balance = await service.getBalance('SEAL');
        console.log('SEAL 余额:', balance);
        expect(balance).toBeGreaterThanOrEqual(0);
      } catch (error) {
        console.error('获取余额失败:', error);
        throw error;
      }
    });
  });

  describe('createOrder', () => {
    it('should create a limit buy order', async () => {
      try {
        // 获取当前市场价格
        const currentPrice = await service.getPrice('SEAL_USDT');
        // 设置一个比市场价高 300% 的卖单价格（确保不会真正成交）
        const sellPrice = currentPrice * 3;
        
        const order = await service.createOrder({
          symbol: 'SEAL_USDT',
          side: Order.Side.Sell,
          amount: 10, // 交易数量
          price: sellPrice,
          type: Order.Type.Limit,
        });

        console.log('创建的订单:', order);
        expect(order.id).toBeDefined();
        expect(order.status).toBe(Order.Status.Open);

        // 取消测试订单
        if (order.id) {
          await service.cancelOrder(order.id, 'SEAL_USDT');
          console.log('测试订单已取消');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        throw error;
      }
    });
  });
}); 