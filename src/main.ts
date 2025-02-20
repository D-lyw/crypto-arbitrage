import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  // 验证必要的环境变量
  if (!process.env.GATE_API_KEY || !process.env.GATE_API_SECRET) {
    throw new Error('请在系统环境中配置 GATE_API_KEY 和 GATE_API_SECRET');
  }

  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 全局异常过滤器
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`交易机器人已启动，监听端口: ${port}`);
  logger.log('正在连接交易所 WebSocket...');
}

bootstrap().catch((error) => {
  console.error('应用启动失败:', error);
  process.exit(1);
});
