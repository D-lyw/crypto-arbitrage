import { Injectable } from '@nestjs/common';
import { BaseExchangeService } from './base-exchange.service';
import { tradingConfig } from '../../config/trading.config';

@Injectable()
export class GateService extends BaseExchangeService {
  constructor() {
    super(
      'gate',
      tradingConfig.gate.apiKey,
      tradingConfig.gate.apiSecret,
      {
        defaultType: 'spot',
      }
    );
  }
} 