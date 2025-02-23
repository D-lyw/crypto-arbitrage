import { Injectable } from '@nestjs/common';
import { TickerService } from './ticker.service';
import { OrderBookService } from './orderbook.service';
import { BalanceService } from './balance.service';

@Injectable()
export class WebSocketFactoryService {
  constructor(
    private readonly tickerService: TickerService,
    private readonly orderBookService: OrderBookService,
    private readonly balanceService: BalanceService,
  ) {}

  getTickerService(exchangeId: string): TickerService {
    this.tickerService.setExchange(exchangeId);
    return this.tickerService;
  }

  getOrderBookService(exchangeId: string): OrderBookService {
    this.orderBookService.setExchange(exchangeId);
    return this.orderBookService;
  }

  getBalanceService(exchangeId: string): BalanceService {
    this.balanceService.setExchange(exchangeId);
    return this.balanceService;
  }
} 