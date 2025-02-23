export const tradingConfig = {
  binance: {
    apiKey: process.env.BINANCE_API_KEY!,
    apiSecret: process.env.BINANCE_API_SECRET!,
    symbols: ['BTC/USDT', 'ETH/USDT'],
  },
  gate: {
    apiKey: process.env.GATE_API_KEY!,
    apiSecret: process.env.GATE_API_SECRET!,
    symbols: ['SEAL/USDT', 'CKB/USDT'],
  },
  okx: {
    apiKey: process.env.OKX_API_KEY!,
    apiSecret: process.env.OKX_API_SECRET!,
    password: process.env.OKX_PASSWORD!,
    symbols: ['BTC/USDT', 'ETH/USDT'],
  },
  
  trading: {
    symbols: {
      'SEAL/USDT': {
        exchanges: ['gate'],
        thresholds: {
          buyThreshold: 50000,
          sellThreshold: 52000,
          tradingAmount: 0.01,
        },
      },
      'CKB/USDT': {
        exchanges: ['gate'],
        thresholds: {
          buyThreshold: 0.01,
          sellThreshold: 0.012,
          tradingAmount: 1000,
        },
      },
      'BTC/USDT': {
        exchanges: ['binance', 'okx'],
        thresholds: {
          buyThreshold: 60000,
          sellThreshold: 65000,
          tradingAmount: 0.001,
        },
      },
    },
    maxTradesPerDay: 10,
  },
  
  system: {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
  }
}; 