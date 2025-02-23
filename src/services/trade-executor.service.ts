import { Injectable, Logger } from '@nestjs/common';
import { TradingStrategyService } from './trading-strategy.service';
import { TradeSignal } from '../types/trading.types';
import { GateApiService } from '../../archive/gate-api.service';
import { tradingConfig } from '../config/trading.config';
import { Order } from 'gate-api';

@Injectable()
export class TradeExecutorService {
  private readonly logger = new Logger(TradeExecutorService.name);
  private lastTradeTime: number = 0;
  private tradesToday: number = 0;

  constructor(
    private readonly strategyService: TradingStrategyService,
    private readonly gateApi: GateApiService,
  ) {
    this.initializeTradeExecution();
  }

  private initializeTradeExecution() {
    // this.strategyService.tradeSignals.subscribe(async (signal) => {
    //   try {
    //     if (this.canTrade()) {
    //       await this.executeTrade(signal);
    //     }
    //   } catch (error) {
    //     this.logger.error(`交易执行失败: ${error.message}`);
    //   }
    // });
  }

  private canTrade(): boolean {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    
    // 重置每日交易计数
    if (this.lastTradeTime < today) {
      this.tradesToday = 0;
    }

    // 检查是否超过每日最大交易次数
    if (this.tradesToday >= tradingConfig.trading.maxTradesPerDay) {
      this.logger.warn('已达到每日最大交易次数限制');
      return false;
    }

    return true;
  }

  private async executeTrade(signal: TradeSignal) {
    this.logger.log(`执行${signal.action}交易: ${signal.symbol} @ ${signal.price}`);

    try {
      // 检查余额
      const currency = signal.action === 'BUY' ? 'USDT' : signal.symbol.replace('USDT', '');
      const balance = await this.gateApi.getBalance(currency);
      
      if (balance < (signal.action === 'BUY' ? signal.price * signal.quantity : signal.quantity)) {
        this.logger.warn(`余额不足: ${currency}`);
        return;
      }

      // 执行交易
      const order = await this.gateApi.createOrder({
        symbol: signal.symbol,
        side: signal.action === 'BUY' ? Order.Side.Buy : Order.Side.Sell,
        amount: signal.quantity,
        price: signal.price,
        type: Order.Type.Limit,
      });

      this.lastTradeTime = Date.now();
      this.tradesToday++;

      this.logger.log(`交易成功 - 订单ID: ${order.id}`);
    } catch (error) {
      this.logger.error(`交易失败: ${error.message}`);
      throw error;
    }
  }
} 