/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ConsoleLogger, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Coxy',
    }),
  });
  const configService = app.get(ConfigService);
  const globalPrefix = configService.get<string>('api.prefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = configService.get<number>('BACKEND_PORT') ?? 3020;
  app.enableCors();
  await app.listen(port);
  Logger.log(`🚀 Coxy backend is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
