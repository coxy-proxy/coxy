import type { FastifyInstance } from 'fastify';

// Simple health endpoint that also checks upstream availability
export default async function (fastify: FastifyInstance) {
  fastify.get('/healthz', async () => {
    const results: Record<string, { ok: boolean; status?: number; error?: string }> = {};

    const withTimeout = async (url: string) => {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 1500);
      try {
        const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
        return { ok: res.ok, status: res.status } as const;
      } catch (err: any) {
        return { ok: false, error: err?.message ?? 'unknown error' } as const;
      } finally {
        clearTimeout(t);
      }
    };

    const backendUrl = (fastify as any).gatewayConfig?.backendUrl ?? 'http://localhost:3020';
    const frontendUrl = (fastify as any).gatewayConfig?.frontendUrl ?? 'http://localhost:3010';

    results.backend = await withTimeout(`${backendUrl}`);
    results.frontend = await withTimeout(`${frontendUrl}`);

    const allOk = Object.values(results).every((r) => r.ok);

    return {
      status: allOk ? 'ok' : 'degraded',
      services: results,
    };
  });
}
