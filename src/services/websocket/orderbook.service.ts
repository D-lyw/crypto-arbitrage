import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';
import { tradingConfig } from '../../config/trading.config';
import { Int, Num, Str } from 'ccxt';

interface OrderBookData {
  symbol: Str;     // CCXT 格式的交易对
  bids: [Num, Num][]; // [价格, 数量]
  asks: [Num, Num][]; // [价格, 数量]
  timestamp: Int;
}

@Injectable()
export class OrderBookService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public orderBookUpdates = new Subject<OrderBookData>();

  constructor() {
    super('OrderBookService');
  }

  async onModuleInit() {
    this.startWatching();
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
      const supportedSymbols = Object.entries(tradingConfig.trading.symbols)
        .filter(([_, config]) => config.exchanges.includes(this.exchangeId))
        .map(([symbol]) => symbol);
      
      for (const symbol of supportedSymbols) {
        try {
          const orderbook = await this.exchange.watchOrderBook(symbol);
          
          this.orderBookUpdates.next({
            symbol: orderbook.symbol,
            bids: orderbook.bids,
            asks: orderbook.asks,
            timestamp: orderbook.timestamp
          });
        } catch (error) {
          this.logger.warn(`监听 ${symbol} 失败: ${error.message}`);
          continue;
        }
      }
    } catch (error) {
      this.logger.error(`监听过程出错: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
} 