import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';
import { tradingConfig } from '../../config/trading.config';
import { Num, Str, Int } from 'ccxt';

interface TickerData {
  exchange: string;   // 添加交易所标识
  symbol: string;
  price: Num;
  bidPrice: Num;
  askPrice: Num;
  volume: Num;
  timestamp: Int;
}

@Injectable()
export class TickerService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public tickerUpdates = new Subject<TickerData>();

  constructor() {
    super('TickerService');
  }

  async onModuleInit() {
    // 初始化时不启动监听，由 factory 设置交易所后启动
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  protected async watch() {
    if (!this.exchangeId || !this.exchange) {
      this.logger.warn('交易所未初始化');
      return;
    }

    try {
      // 获取该交易所支持的交易对
      const supportedSymbols = this.getSupportedSymbols();
      
      for (const symbol of supportedSymbols) {
        try {
          const ticker = await this.exchange.watchTicker(symbol);
          
          this.tickerUpdates.next({
            exchange: this.exchangeId,
            symbol: ticker.symbol,
            price: ticker.last,
            bidPrice: ticker.bid,
            askPrice: ticker.ask,
            volume: ticker.baseVolume,
            timestamp: ticker.timestamp
          });
        } catch (error) {
          this.logger.warn(`监听 ${symbol} 失败: ${error.message}`);
          // 继续监听其他交易对
          continue;
        }
      }
    } catch (error) {
      this.logger.error(`监听过程出错: ${error.message}`);
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  private getSupportedSymbols(): string[] {
    const allSymbols = Object.entries(tradingConfig.trading.symbols)
      .filter(([_, config]) => config.exchanges.includes(this.exchangeId))
      .map(([symbol]) => symbol);

    return allSymbols;
  }

  async setExchange(exchangeId: string) {
    await super.setExchange(exchangeId);
    // 设置交易所后启动监听
    this.startWatching();
    return this;
  }
} 