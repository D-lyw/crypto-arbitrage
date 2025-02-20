import { Module } from '@nestjs/common';
import { TickerService } from './services/websocket/ticker.service';
import { OrderBookService } from './services/websocket/orderbook.service';
import { BalanceService } from './services/websocket/balance.service';
import { PriceService } from './services/price.service';
import { TradingStrategyService } from './services/trading-strategy.service';
import { TradeExecutorService } from './services/trade-executor.service';
import { GateApiService } from './services/gate-api.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    TickerService,
    OrderBookService,
    BalanceService,
    PriceService,
    TradingStrategyService,
    TradeExecutorService,
    GateApiService,
  ],
})
export class AppModule {}
