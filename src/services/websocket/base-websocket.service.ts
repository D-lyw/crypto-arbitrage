import { Logger } from '@nestjs/common';
import { Subject } from 'rxjs';
import * as ccxt from 'ccxt';
import { tradingConfig } from '../../config/trading.config';

export abstract class BaseWebSocketService {
  protected readonly logger: Logger;
  protected exchange: ccxt.Exchange;
  protected isRunning: boolean = false;
  protected exchangeId: string;
 
  constructor(serviceName: string) {
    this.logger = new Logger(serviceName);
  }

  async setExchange(exchangeId: string) {
    this.exchangeId = exchangeId;
    await this.initializeExchange();
    return this;
  }

  private async initializeExchange() {
    const config = tradingConfig[this.exchangeId];
    const exchangeClass = ccxt.pro[this.exchangeId];
    
    if (!exchangeClass) {
      throw new Error(`不支持的交易所: ${this.exchangeId}`);
    }

    this.exchange = new exchangeClass({
      apiKey: config.apiKey,
      secret: config.apiSecret,
      password: config.password,
      enableRateLimit: true,
    });

    // 添加重试机制
    const maxRetries = 3;
    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.exchange.loadMarkets();
        this.logger.log(`${this.exchangeId} 市场数据加载完成`);
        return;
      } catch (error) {
        this.logger.warn(`第${i + 1}次加载${this.exchangeId}市场数据失败: ${error.message}`);
        if (i === maxRetries - 1) {
          throw error;
        }
        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  protected async startWatching() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log(`Websocket ${this.constructor.name} started`);

    try {
      while (this.isRunning) {
        try {
          await this.watch();
        } catch (error) {
          this.logger.error(`监听错误: ${error.message}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    } finally {
      this.isRunning = false;
    }
  }

  protected stopWatching() {
    this.isRunning = false;
    console.log(`Websocket ${this.constructor.name} ended`);
  }

  protected abstract watch(): Promise<void>;
}