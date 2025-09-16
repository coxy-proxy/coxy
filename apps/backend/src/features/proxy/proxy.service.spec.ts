import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProxyService } from './proxy.service';
import type { TokenResolverService } from './token-resolver.service';

function makeConfig() {
  return {
    'github.copilot.copilotApiUrl': 'https://api.githubcopilot.com',
    'api.prefix': 'api',
    'github.copilot.headers': { 'x-config': 'yes' },
  } as Record<string, any>;
}

describe('ProxyService', () => {
  let http: jest.Mocked<HttpService> | any;
  let tokenResolver: jest.Mocked<TokenResolverService> | any;
  let config: jest.Mocked<ConfigService> | any;
  let service: ProxyService;

  beforeEach(() => {
    http = { request: vi.fn() } as any;
    tokenResolver = { resolveCopilotToken: vi.fn() } as any;
    config = { get: vi.fn((k: string) => makeConfig()[k]) } as any;
    service = new ProxyService(http, tokenResolver, config);
  });

  it('proxies chat/completions with resolved token and sets content-length', async () => {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/chat/completions',
      headers: { authorization: 'Bearer user-key', 'x-foo': ['a', 'b'] },
      body: { model: 'gpt', messages: [{ role: 'user', content: 'hi' }] },
    };
    const res: any = {
      setHeader: vi.fn(),
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const data = { pipe: vi.fn() };
    http.request.mockReturnValue(of({ headers: { 'content-type': 'application/json' }, data }));
    tokenResolver.resolveCopilotToken.mockResolvedValue({ token: 'copilot-token', expiresAt: Date.now() + 3600_000 });

    await service.proxyRequest(req, res);

    // Validate http request built correctly
    expect(http.request).toHaveBeenCalledTimes(1);
    const args = http.request.mock.calls[0][0];
    expect(args.method).toBe('POST');
    expect(args.url).toBe('https://api.githubcopilot.com/chat/completions');
    expect(args.data).toEqual(req.body);
    expect(args.responseType).toBe('stream');
    expect(args.headers.authorization).toBe('Bearer copilot-token');
    expect(args.headers['x-config']).toBe('yes');
    expect(args.headers['x-foo']).toBe('a,b');
    expect(typeof args.headers['content-length']).toBe('string');

    // Response piping
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'application/json');
    expect(data.pipe).toHaveBeenCalledWith(res);
  });

  it('proxies GET /models without resolving token', async () => {
    const req: any = {
      method: 'GET',
      originalUrl: '/api/models?limit=10',
      headers: { 'x-bar': 'v' },
    };
    const res: any = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn() };
    const data = { pipe: vi.fn() };
    http.request.mockReturnValue(of({ headers: { 'content-type': 'text/plain' }, data }));

    await service.proxyRequest(req, res);

    expect(tokenResolver.resolveCopilotToken).not.toHaveBeenCalled();
    const args = http.request.mock.calls[0][0];
    expect(args.method).toBe('GET');
    expect(args.url).toBe('https://api.githubcopilot.com/models?limit=10');
    expect(args.data).toBeUndefined();
    expect(args.headers['content-length']).toBeUndefined();
    expect(res.setHeader).toHaveBeenCalledWith('content-type', 'text/plain');
    expect(data.pipe).toHaveBeenCalledWith(res);
  });

  it('handles proxy errors and writes status/message', async () => {
    const req: any = {
      method: 'POST',
      originalUrl: '/api/chat/completions',
      headers: { authorization: 'Bearer user-key' },
      body: { model: 'gpt', messages: [] },
    };
    const res: any = { status: vi.fn().mockReturnThis(), json: vi.fn(), setHeader: vi.fn() };

    const err = Object.assign(new Error('Unauthorized'), { response: { status: 401 } });
    http.request.mockReturnValue(throwError(() => err));
    tokenResolver.resolveCopilotToken.mockResolvedValue({ token: 'x', expiresAt: Date.now() + 1_000_000 });

    await service.proxyRequest(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
  });
});
