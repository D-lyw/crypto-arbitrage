import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';
import { tradingConfig } from '../../config/trading.config';

interface OrderBookData {
  symbol: string;
  bestBid: number;
  bestAsk: number;
  time: number;
}

@Injectable()
export class OrderBookService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public orderBookUpdates = new Subject<OrderBookData>();

  constructor() {
    super('OrderBookService');
  }

  async onModuleInit() {
    await this.connectWebSocket();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  protected handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      if (message.event === 'update' && message.channel === 'spot.book_ticker') {
        const { currency_pair, bid, ask, t } = message.result;
        this.orderBookUpdates.next({
          symbol: currency_pair,
          bestBid: parseFloat(bid),
          bestAsk: parseFloat(ask),
          time: t
        });
      }
    } catch (error) {
      this.logger.error(`处理消息失败: ${error.message}`);
    }
  }

  protected subscribe() {
    const subscribeMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: 'spot.book_ticker',
      event: 'subscribe',
      payload: tradingConfig.trading.symbols
    };
    this.ws.send(JSON.stringify(subscribeMessage));
  }
} 