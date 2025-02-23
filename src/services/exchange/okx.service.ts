import { Injectable } from '@nestjs/common';
import { BaseExchangeService } from './base-exchange.service';
import { tradingConfig } from '../../config/trading.config';

@Injectable()
export class OkxService extends BaseExchangeService {
  constructor() {
    super(
      'okx',
      tradingConfig.okx.apiKey,
      tradingConfig.okx.apiSecret,
      {
        // OKX 特定的配置
        defaultType: 'spot',
        password: tradingConfig.okx.password, // OKX 需要额外的 password/passphrase
      }
    );
  }
} 