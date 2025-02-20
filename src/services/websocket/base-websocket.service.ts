import { Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import { Subject } from 'rxjs';
import { tradingConfig } from '../../config/trading.config';
import * as crypto from 'crypto';

export abstract class BaseWebSocketService {
  protected readonly logger: Logger;
  protected ws: WebSocket;
  protected pingInterval: NodeJS.Timeout;
  protected reconnectTimeout: NodeJS.Timeout;
  protected requiresAuth: boolean = false;

  constructor(serviceName: string, requiresAuth: boolean = false) {
    this.logger = new Logger(serviceName);
    this.requiresAuth = requiresAuth;
  }

  protected generateSignature(channel: string, event: string, timestamp: number): string {
    const message = `channel=${channel}&event=${event}&time=${timestamp}`;
    return crypto
      .createHmac('sha512', tradingConfig.exchange.apiSecret)
      .update(message)
      .digest('hex');
  }

  protected getAuthPayload(channel: string, event: string, timestamp: number) {
    return {
      method: 'api_key',
      KEY: tradingConfig.exchange.apiKey,
      SIGN: this.generateSignature(channel, event, timestamp)
    };
  }

  protected sendMessage(channel: string, event: string, payload: any = null) {
    const timestamp = Math.floor(Date.now() / 1000);
    const message: any = {
      time: timestamp,
      channel: channel,
      event: event,
      payload: payload
    };

    if (this.requiresAuth) {
      message.auth = this.getAuthPayload(channel, event, timestamp);
    }

    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      this.logger.warn('WebSocket 未连接,无法发送消息');
    }
  }

  protected async connectWebSocket() {
    try {
      this.ws = new WebSocket(tradingConfig.exchange.wsEndpoint);

      this.ws.on('open', () => {
        this.logger.log('WebSocket 已连接');
        this.setupPingInterval();
        this.subscribe();
      });

      this.ws.on('message', this.handleMessage.bind(this));

      this.ws.on('close', () => {
        this.logger.warn('WebSocket 连接已关闭');
        this.cleanup();
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        this.logger.error(`WebSocket 错误: ${error.message}`);
      });

    } catch (error) {
      this.logger.error(`建立 WebSocket 连接失败: ${error}`);
      this.scheduleReconnect();
    }
  }

  protected abstract handleMessage(data: string): void;
  protected abstract subscribe(): void;

  protected setupPingInterval() {
    this.pingInterval = setInterval(() => {
      if (this.ws.readyState === WebSocket.OPEN) {
        const pingMessage = {
          time: Math.floor(Date.now() / 1000),
          channel: 'spot.ping'
        };
        this.ws.send(JSON.stringify(pingMessage));
      }
    }, 5000);
  }

  protected scheduleReconnect() {
    this.reconnectTimeout = setTimeout(() => {
      this.logger.log('尝试重新连接...');
      this.connectWebSocket();
    }, 10000);
  }

  protected cleanup() {
    if (this.pingInterval) clearInterval(this.pingInterval);
    if (this.reconnectTimeout) clearTimeout(this.reconnectTimeout);
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }
    }
  }
} 