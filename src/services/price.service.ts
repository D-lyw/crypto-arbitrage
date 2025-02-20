import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import * as WebSocket from 'ws';
import { tradingConfig } from '../config/trading.config';

interface GateTickerResponse {
  time: number;
  time_ms: number;
  channel: string;
  event: string;
  result: {
    currency_pair: string;
    last: string;
    lowest_ask: string;
    highest_bid: string;
    change_percentage: string;
    base_volume: string;
    quote_volume: string;
    high_24h: string;
    low_24h: string;
  };
}

@Injectable()
export class PriceService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PriceService.name);
  private ws: WebSocket;
  private pingInterval: NodeJS.Timeout;
  private reconnectTimeout: NodeJS.Timeout;

  // 价格更新的主题
  public priceUpdates = new Subject<{ symbol: string; price: number }>();

  async onModuleInit() {
    await this.connectWebSocket();
  }

  onModuleDestroy() {
    this.cleanup();
  }

  private async connectWebSocket() {
    try {
      this.ws = new WebSocket(tradingConfig.exchange.wsEndpoint);

      this.ws.on('open', () => {
        this.logger.log('WebSocket 已连接');
        this.setupPingInterval();
        this.subscribe();
      });

      this.ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data) as GateTickerResponse;
          
          // 处理订阅确认消息
          if (message.event === 'subscribe') {
            this.logger.log(`已成功订阅 ${message.channel}`);
            return;
          }

          // 处理价格更新
          if (message.event === 'update' && message.channel === 'spot.tickers') {
            const { currency_pair, last } = message.result;
            if (last) {
              this.priceUpdates.next({
                symbol: currency_pair,
                price: parseFloat(last)
              });
            }
          }
        } catch (error) {
          this.logger.error(`处理消息失败: ${error.message}`);
        }
      });

      this.ws.on('close', () => {
        this.logger.warn('WebSocket 连接已关闭');
        this.cleanup();
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        this.logger.error(`WebSocket 错误: ${error.message}`);
      });

    } catch (error) {
      this.logger.error(`建立 WebSocket 连接失败: ${error}`);
      this.scheduleReconnect();
    }
  }

  private subscribe() {
    const subscribeMessage = {
      time: Math.floor(Date.now() / 1000),
      channel: 'spot.tickers',
      event: 'subscribe',
      payload: tradingConfig.trading.symbols
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  private setupPingInterval() {
    // 每 5 秒发送一次 ping 消息
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          time: Math.floor(Date.now() / 1000),
          channel: 'spot.ping'
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 5000);
  }

  private scheduleReconnect() {
    // 10 秒后尝试重新连接
    this.reconnectTimeout = setTimeout(() => {
      this.logger.log('尝试重新连接...');
      this.connectWebSocket();
    }, 10000);
  }

  private cleanup() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    }
  }
} 