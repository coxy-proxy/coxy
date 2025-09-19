/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { ConsoleLogger, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { PrismaService } from './shared/prisma/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger({
      prefix: 'Coxy',
    }),
  });
  const logger = new Logger('bootstrap');

  const configService = app.get(ConfigService);
  const globalPrefix = configService.get<string>('api.prefix') ?? 'api';
  app.setGlobalPrefix(globalPrefix);
  const port = configService.get<number>('BACKEND_PORT') ?? 3020;
  app.enableCors();

  // Prisma health and graceful shutdown
  app.enableShutdownHooks();
  const prisma = app.get(PrismaService);
  try {
    await prisma.$connect();
    await prisma.$queryRaw`SELECT 1 from ApiKey;`;
  } catch (e) {
    logger.error(e.name, e.message);
    logger.error(`Is the DATABASE_URL ${process.env.DATABASE_URL} provisioned?`);
    throw new Error('Unable to connect to the database and verify the schema');
  }
  logger.log('Database connection established');

  await app.listen(port);
  logger.log(`🚀 Coxy backend is running on: http://localhost:${port}/${globalPrefix}`);
}

bootstrap();
