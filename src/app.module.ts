import { Module } from '@nestjs/common';
import { TickerService } from './services/websocket/ticker.service';
import { OrderBookService } from './services/websocket/orderbook.service';
import { BalanceService } from './services/websocket/balance.service';
import { TradingStrategyService } from './services/trading-strategy.service';
import { TradeExecutorService } from './services/trade-executor.service';
import { GateApiService } from '../archive/gate-api.service';
import { WebSocketFactoryService } from './services/websocket/websocket-factory.service';

@Module({
  imports: [],
  controllers: [],
  providers: [
    TickerService,
    OrderBookService,
    BalanceService,
    WebSocketFactoryService,
    TradingStrategyService,
    TradeExecutorService,
    GateApiService,
  ],
})
export class AppModule {}
