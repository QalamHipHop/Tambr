import { NestFactory } from '@nestjs/core';
import { RelayerModule } from './relayer.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(RelayerModule);
  const port = process.env.RELAYER_PORT || 3001;
  await app.listen(port);
  Logger.log(`Relayer service is running on: http://localhost:${port}`, 'Bootstrap');
}
bootstrap();
