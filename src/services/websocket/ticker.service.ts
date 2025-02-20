import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';
import { tradingConfig } from '../../config/trading.config';

interface TickerData {
  symbol: string;
  price: number;
  time: number;
}

@Injectable()
export class TickerService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public tickerUpdates = new Subject<TickerData>();

  constructor() {
    super('TickerService');
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
      
      if (message.event === 'subscribe') {
        this.logger.log(`已成功订阅 ${message.channel}`);
        return;
      }

      if (message.event === 'update' && message.channel === 'spot.tickers') {
        const { currency_pair, last, time } = message.result;
        if (last) {
          this.tickerUpdates.next({
            symbol: currency_pair,
            price: parseFloat(last),
            time: time
          });
        }
      }
    } catch (error) {
      this.logger.error(`处理消息失败: ${error.message}`);
    }
  }

  protected subscribe() {
    const subscribeMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: 'spot.tickers',
      event: 'subscribe',
      payload: tradingConfig.trading.symbols
    };
    this.ws.send(JSON.stringify(subscribeMessage));
  }
} 