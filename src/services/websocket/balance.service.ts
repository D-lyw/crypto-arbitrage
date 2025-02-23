import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Subject } from 'rxjs';
import { BaseWebSocketService } from './base-websocket.service';

interface BalanceData {
  currency: string;
  free: number;      // 可用余额
  used: number;      // 冻结余额
  total: number;     // 总余额
  timestamp: number;
}

@Injectable()
export class BalanceService extends BaseWebSocketService implements OnModuleInit, OnModuleDestroy {
  public balanceUpdates = new Subject<BalanceData>();

  constructor() {
    super('BalanceService');
  }

  async onModuleInit() {
    this.startWatching();
  }

  onModuleDestroy() {
    this.stopWatching();
  }

  protected async watch() {
    const balance = await this.exchange.watchBalance();
    
    for (const [currency, data] of Object.entries(balance)) {
      this.balanceUpdates.next({
        currency,
        free: Number(data.free),
        used: Number(data.used),
        total: Number(data.total),
        timestamp: Date.now()
      });
    }
  }
} 