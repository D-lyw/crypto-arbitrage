import { Injectable, Logger } from '@nestjs/common';
import * as GateApi from 'gate-api';
import { tradingConfig } from '../config/trading.config';
import { OrderParams, OrderResult } from '../types/exchange.types';

@Injectable()
export class GateApiService {
  private readonly logger = new Logger(GateApiService.name);
  private readonly spotApi: GateApi.SpotApi;
  private readonly client: GateApi.ApiClient;

  constructor() {
    const { apiKey, apiSecret } = tradingConfig.exchange;

    this.client = new GateApi.ApiClient();
    this.client.setApiKeySecret(apiKey, apiSecret);
    this.spotApi = new GateApi.SpotApi(this.client);
  }

  async getPrice(symbol: string): Promise<number> {
    try {
      const response = await this.spotApi.listTickers({ currencyPair: symbol });
      return parseFloat(response.body[0].last!);
    } catch (error) {
      this.logger.error(`获取价格失败: ${error.message}`);
      throw error;
    }
  }

  async createOrder(params: OrderParams): Promise<GateApi.Order> {
    try {
      const order = new GateApi.Order();
      order.currencyPair = params.symbol;
      order.side = params.side;
      order.amount = String(params.amount);
      order.price = String(params.price);
      order.type = params.type;

      const response = await this.spotApi.createOrder(order, {});
      return response.body;
    } catch (error) {
      this.logger.error(`创建订单失败: ${error.message}`);
      throw error;
    }
  }

  async getBalance(currency?: string): Promise<number> {
    try {
      const response = await this.spotApi.listSpotAccounts({ currency });
      return parseFloat(response.body[0].available!);
    } catch (error) {
      this.logger.error(`获取余额失败: ${error.message}`);
      throw error;
    }
  }

  async cancelOrder(orderId: string, symbol: string): Promise<boolean> {
    try {
      await this.spotApi.cancelOrder(orderId, symbol, {});
      return true;
    } catch (error) {
      this.logger.error(`取消订单失败: ${error.message}`);
      throw error;
    }
  }
} 