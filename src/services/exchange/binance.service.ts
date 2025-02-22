import { Injectable } from '@nestjs/common';
import { BaseExchangeService } from './base-exchange.service';
import { tradingConfig } from '../../config/trading.config';

@Injectable()
export class BinanceService extends BaseExchangeService {
  constructor() {
    super(
      'binance',
      tradingConfig.binance.apiKey,
      tradingConfig.binance.apiSecret,
      {
        // Binance 特定的配置
        defaultType: 'spot',
      }
    );
  }
} 