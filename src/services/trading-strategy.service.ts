import { Injectable, Logger } from '@nestjs/common';
import { TradeSignal } from '../types/trading.types';
import { Subject, combineLatest } from 'rxjs';
import { WebSocketFactoryService } from './websocket/websocket-factory.service';
import { tradingConfig } from '../config/trading.config';

@Injectable()
export class TradingStrategyService {
  private readonly logger = new Logger(TradingStrategyService.name);
  public tradeSignals = new Subject<TradeSignal>();
  
  constructor(
    private readonly wsFactory: WebSocketFactoryService,
  ) {
    this.initializeStrategy();
  }

  private initializeStrategy() {
    // 获取不同交易所的服务
    const gateTickerService = this.wsFactory.getTickerService('gate');
    const binanceTickerService = this.wsFactory.getTickerService('binance');
    const okxTickerService = this.wsFactory.getTickerService('okx');

    // 组合多个交易所的数据流
    combineLatest([
      gateTickerService.tickerUpdates,
      binanceTickerService.tickerUpdates,
      okxTickerService.tickerUpdates
    ]).subscribe(([gateTicker, binanceTicker, okxTicker]) => {
      // 处理多个交易所的价格数据
      this.analyzePrices({
        gate: gateTicker,
        binance: binanceTicker,
        okx: okxTicker
      });
    });

    // 订阅订单簿数据
    const gateOrderBook = this.wsFactory.getOrderBookService('gate');
    const binanceOrderBook = this.wsFactory.getOrderBookService('binance');
    
    combineLatest([
      gateOrderBook.orderBookUpdates,
      binanceOrderBook.orderBookUpdates
    ]).subscribe(([gateOB, binanceOB]) => {
      // 分析订单簿套利机会
      this.analyzeArbitrage({
        gate: gateOB,
        binance: binanceOB
      });
    });
  }

  private analyzePrices(prices: Record<string, any>) {
    try {
      // 按交易对分组处理价格数据
      const symbolPrices = new Map<string, Map<string, number>>();
      
      for (const [exchange, data] of Object.entries(prices)) {
        const symbol = data.symbol;
        if (!symbolPrices.has(symbol)) {
          symbolPrices.set(symbol, new Map());
        }
        symbolPrices.get(symbol)!.set(exchange, data.price);
      }

      // 分析每个交易对在不同交易所的价格差异
      for (const [symbol, exchangePrices] of symbolPrices) {
        const config = tradingConfig.trading.symbols[symbol];
        if (!config) continue;

        // 只分析配置中指定的交易所
        const validPrices = Array.from(exchangePrices.entries())
          .filter(([exchange]) => config.exchanges.includes(exchange));

        if (validPrices.length > 1) {
          this.analyzePriceDifference(symbol, validPrices);
        }
      }
    } catch (error) {
      this.logger.error(`分析价格时出错: ${error.message}`);
    }
  }

  private analyzeArbitrage(orderBooks: Record<string, any>) {
    // 实现套利分析逻辑
    this.logger.debug('分析套利机会:', orderBooks);
  }

  private analyzePriceDifference(symbol: string, prices: [string, number][]) {
    const [lowestPrice, highestPrice] = prices.reduce(
      ([min, max], [_, price]) => [
        Math.min(min, price),
        Math.max(max, price)
      ],
      [Infinity, -Infinity]
    );

    const priceDiff = ((highestPrice - lowestPrice) / lowestPrice) * 100;
    this.logger.debug(`${symbol} 价格差异: ${priceDiff.toFixed(2)}%`);
  }
} 