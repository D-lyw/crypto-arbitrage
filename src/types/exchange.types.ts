import { Order } from 'gate-api';

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
}

export interface OrderParams {
  symbol: string;
  side: Order.Side;
  amount: number;
  price: number;
  type: Order.Type;
}

export interface OrderResult {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  status: 'open' | 'closed' | 'canceled';
  timestamp: number;
} 