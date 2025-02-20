export interface PriceData {
  symbol: string;
  price: number;
  timestamp: number;
}

export interface TradeSignal {
  symbol: string;
  action: 'BUY' | 'SELL';
  price: number;
  quantity: number;
}

export interface TradingConfig {
  symbol: string;
  buyThreshold: number;
  sellThreshold: number;
  tradingAmount: number;
} 