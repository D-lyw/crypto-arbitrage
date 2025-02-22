import { Logger } from '@nestjs/common';
import * as ccxt from 'ccxt';

export abstract class BaseExchangeService {
  protected exchange: ccxt.Exchange;
  protected readonly logger: Logger;

  constructor(
    exchangeId: string,
    apiKey: string,
    secret: string,
    options: ccxt.ExchangeOptions = {}
  ) {
    this.logger = new Logger(`${exchangeId}Service`);
    this.exchange = new ccxt[exchangeId]({
      apiKey,
      secret,
      ...options
    });
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const ticker = await this.exchange.fetchTicker(symbol);
      return ticker.last;
    } catch (error) {
      this.logger.error(`获取价格失败: ${error.message}`);
      throw error;
    }
  }

  async getBalance(currency?: string): Promise<number> {
    try {
      const balance = await this.exchange.fetchBalance();
      return currency ? balance[currency].free : balance;
    } catch (error) {
      this.logger.error(`获取余额失败: ${error.message}`);
      throw error;
    }
  }

  async createOrder(params: {
    symbol: string;
    type: 'limit' | 'market';
    side: 'buy' | 'sell';
    amount: number;
    price?: number;
  }) {
    try {
      return await this.exchange.createOrder(
        params.symbol,
        params.type,
        params.side,
        params.amount,
        params.price
      );
    } catch (error) {
      this.logger.error(`创建订单失败: ${error.message}`);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string) {
    try {
      return await this.exchange.cancelOrder(orderId, symbol);
    } catch (error) {
      this.logger.error(`取消订单失败: ${error.message}`);
      throw error;
    }
  }
} 