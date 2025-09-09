import 'dotenv/config';
import Fastify from 'fastify';
import { app } from './app/app';

// Environment configuration with sensible defaults
const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;
const backendHost = process.env.BACKEND_HOST ?? 'localhost';
const backendPort = process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 3020;
const frontendHost = process.env.FRONTEND_HOST ?? 'localhost';
const frontendPort = process.env.FRONTEND_PORT ? Number(process.env.FRONTEND_PORT) : 3010;

import { logger } from '@/shared/logger';

// Instantiate Fastify with some config
const server = Fastify({
  loggerInstance: logger,
});

// Log configuration on startup
server.log.info('Loading environment configuration...');
server.log.info(`Backend API: http://${backendHost}:${backendPort}`);
server.log.info(`Frontend App: http://${frontendHost}:${frontendPort}`);

// Expose config to the app via decorators
server.decorate('gatewayConfig', {
  backendUrl: `http://${backendHost}:${backendPort}`,
  frontendUrl: `http://${frontendHost}:${frontendPort}`,
});

// Register your application as a normal plugin.
server.register(app);

// Graceful shutdown handling
const close = async () => {
  try {
    await server.close();
    process.exit(0);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};
process.on('SIGINT', close);
process.on('SIGTERM', close);

// Start listening.
server.listen({ port, host }, (err) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  } else {
    server.log.info(`🚀 Coxy gateway listening on ${host}:${port}`);
  }
});
