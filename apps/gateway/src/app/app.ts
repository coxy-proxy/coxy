import AutoLoad from '@fastify/autoload';
import httpProxy from '@fastify/http-proxy';
import type { FastifyInstance } from 'fastify';
import * as path from 'path';

/* eslint-disable-next-line */
export type AppOptions = {};

export async function app(fastify: FastifyInstance, opts: AppOptions) {
  // Global error handler for graceful upstream failures
  fastify.setErrorHandler((error, _request, reply) => {
    const code = (error as any)?.code;
    const isUpstreamDown =
      code === 'ECONNREFUSED' ||
      code === 'ECONNRESET' ||
      code === 'EAI_AGAIN' ||
      code === 'ENOTFOUND' ||
      code === 'UND_ERR_CONNECT_TIMEOUT';

    if (isUpstreamDown) {
      fastify.log.error({ err: error }, 'Upstream service unavailable');
      return reply.status(502).send({ error: 'Bad Gateway', message: 'Upstream service unavailable' });
    }

    fastify.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send({ error: 'Internal Server Error' });
  });

  // Load support plugins
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins'),
    options: { ...opts },
  });

  // Load routes (e.g., health endpoints)
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: { ...opts },
  });

  // Proxy: API -> Backend
  const backendUrl = (fastify as any).gatewayConfig?.backendUrl ?? 'http://localhost:3020';
  // Proxy at /api and rewrite path to include /api at upstream
  fastify.register(httpProxy, {
    upstream: backendUrl,
    prefix: '/api',
    rewritePrefix: '/api',
    httpMethods: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
    // Error handling falls back to the global error handler
  });

  // Proxy: Everything else -> Frontend
  const frontendUrl = (fastify as any).gatewayConfig?.frontendUrl ?? 'http://localhost:3010';
  fastify.register(httpProxy, {
    upstream: frontendUrl,
    prefix: '/',
    httpMethods: ['DELETE', 'GET', 'HEAD', 'PATCH', 'POST', 'PUT', 'OPTIONS'],
  });

  fastify.log.info('Routes configured: /api/* -> Backend API, /* -> Frontend App');
}
