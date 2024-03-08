import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupWsServer } from './ws/ws'


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // 设置跨域 *
  app.enableCors();
  await app.listen(54321);
  setupWsServer();
}
bootstrap();
