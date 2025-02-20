export const tradingConfig = {
  exchange: {
    wsEndpoint: "wss://api.gateio.ws/ws/v4/",
    apiKey: process.env.GATE_API_KEY!,
    apiSecret: process.env.GATE_API_SECRET!,
  },
  
  trading: {
    symbols: ['SEAL_USDT', 'CKB_USDT'],
    thresholds: {
      'SEAL_USDT': {
        buyThreshold: 50000,
        sellThreshold: 52000,
        tradingAmount: 0.01,
      },
      'CKB_USDT': {
        buyThreshold: 0.01,
        sellThreshold: 0.012,
        tradingAmount: 1000,
      }
    },
    maxTradesPerDay: 10,
  },
  
  system: {
    port: process.env.PORT || 3000,
    logLevel: process.env.LOG_LEVEL || 'info',
  }
}; 