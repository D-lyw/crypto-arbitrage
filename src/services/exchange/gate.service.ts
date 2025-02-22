import { Injectable } from '@nestjs/common';
import { BaseExchangeService } from './base-exchange.service';
import { tradingConfig } from '../../config/trading.config';

@Injectable()
export class GateService extends BaseExchangeService {
  constructor() {
    super(
      'gateio',
      tradingConfig.exchange.apiKey,
      tradingConfig.exchange.apiSecret,
      {
        // Gate.io 特定的配置
        defaultType: 'spot',
      }
    );
  }
} 