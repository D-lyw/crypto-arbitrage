import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';

interface BalanceData {
  currency: string;
  available: string;
  locked: string;
}

@Injectable()
export class BalanceService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public balanceUpdates = new Subject<BalanceData>();

  constructor() {
    super('BalanceService', true);
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
      
      if (message.event === 'update' && message.channel === 'spot.balances') {
        console.log(message);
        const { currency, available, locked } = message.result;
        this.balanceUpdates.next({
          currency,
          available,
          locked
        });
      }
    } catch (error) {
      this.logger.error(`处理消息失败: ${error.message}`);
    }
  }

  protected subscribe() {
    this.sendMessage('spot.balances', 'subscribe', []);
  }
} 