import { Test, TestingModule } from '@nestjs/testing';
import { BinanceService } from './binance.service';

describe('BinanceService', () => {
  let service: BinanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BinanceService],
    }).compile();

    service = module.get<BinanceService>(BinanceService);
  });

  describe('getPrice', () => {
    it('should get price for UNI/USDT', async () => {
      try {
        const price = await service.getPrice('UNI/USDT');
        console.log('UNI/USDT 价格:', price);
        expect(price).toBeGreaterThan(0);
      } catch (error) {
        console.error('获取价格失败:', error);
        throw error;
      }
    });

    it('should handle invalid symbol', async () => {
      await expect(service.getPrice('INVALID/PAIR'))
        .rejects
        .toThrow();
    });
  });

  describe('getBalance', () => {
    it('should get balance for USDT', async () => {
      try {
        // Binance 交易所的余额查询不支持传入币种参数
        const balance = await service.getBalance();
        console.log('USDT 余额:', balance);
        expect(balance).toBeDefined();
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
        const price = await service.getPrice('UNI/USDT');
        if (!price) throw new Error('无法获取价格');
        
        // 设置一个比市场价高 200% 的卖单价格（确保不会真正成交）
        const sellPrice = Number(price) * 2;
        
        const order = await service.createOrder({
          symbol: 'UNI/USDT',
          type: 'limit',
          side: 'sell',
          amount: 1, 
          price: sellPrice,
        });

        console.log('创建的订单:', order);
        expect(order.id).toBeDefined();
        
        // 取消测试订单
        if (order.id) {
          await service.cancelOrder(order.id, 'UNI/USDT');
          console.log('测试订单已取消');
        }
      } catch (error) {
        console.error('创建订单失败:', error);
        throw error;
      }
    });
  });
}); 