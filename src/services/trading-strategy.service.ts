import { Injectable, Logger } from '@nestjs/common';
import { PriceService } from './price.service';
import { TradeSignal, TradingConfig } from '../types/trading.types';
import { Subject } from 'rxjs';
import { tradingConfig } from '../config/trading.config';
import { TickerService } from './websocket/ticker.service';
import { OrderBookService } from './websocket/orderbook.service';
import { BalanceService } from './websocket/balance.service';

@Injectable()
export class TradingStrategyService {
  private readonly logger = new Logger(TradingStrategyService.name);
  public tradeSignals = new Subject<TradeSignal>();
  
  constructor(
    private readonly priceService: PriceService,
    private readonly tickerService: TickerService,
    private readonly orderBookService: OrderBookService,
    private readonly balanceService: BalanceService,
  ) {
    this.initializeStrategy();
  }

  private initializeStrategy() {
    this.priceService.priceUpdates.subscribe(priceData => {
      console.log(priceData);
      const thresholds = tradingConfig.trading.thresholds[priceData.symbol];
      
      if (!thresholds) {
        return;
      }

      if (priceData.price <= thresholds.buyThreshold) {
        this.tradeSignals.next({
          symbol: priceData.symbol,
          action: 'BUY',
          price: priceData.price,
          quantity: thresholds.tradingAmount,
        });
      } else if (priceData.price >= thresholds.sellThreshold) {
        this.tradeSignals.next({
          symbol: priceData.symbol,
          action: 'SELL',
          price: priceData.price,
          quantity: thresholds.tradingAmount,
        });
      }
    });

    // 订阅价格更新
    this.tickerService.tickerUpdates.subscribe(ticker => {
      // 处理价格更新
    });

    // 订阅订单簿更新
    this.orderBookService.orderBookUpdates.subscribe(orderBook => {
      // 处理订单簿更新
      console.log(orderBook);
    });

    // 订阅余额更新
    this.balanceService.balanceUpdates.subscribe(balance => {
      // 处理余额更新
      console.log(balance);
    });
  }
} 