import type { Request } from 'express';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GithubOauthService } from '../api-keys/github-oauth.service';
import { TokenResolverService } from './token-resolver.service';

function makeReq(auth?: string): Request {
  return { headers: auth ? { authorization: auth } : {} } as any;
}

describe('TokenResolverService', () => {
  let github: jest.Mocked<GithubOauthService> | any;
  let service: TokenResolverService;

  beforeEach(() => {
    github = { fetchCopilotMeta: vi.fn() } as any;
    service = new TokenResolverService(github);
    vi.useFakeTimers();
    vi.setSystemTime(1_700_000_000_000);
  });

  it('throws if no user key', async () => {
    await expect(service.resolveCopilotToken(makeReq())).rejects.toThrow('Missing API key');
  });

  it('returns token from github when not cached', async () => {
    github.fetchCopilotMeta.mockResolvedValue({ token: 'A', expiresAt: Date.now() + 10 * 60_000 });
    const entry = await service.resolveCopilotToken(makeReq('Bearer userkey'));
    expect(entry).toEqual({ token: 'A', expiresAt: Date.now() + 10 * 60_000 });
  });

  it('caches fresh entries and avoids refetch', async () => {
    github.fetchCopilotMeta.mockResolvedValue({ token: 'A', expiresAt: Date.now() + 10 * 60_000 });
    const first = await service.resolveCopilotToken(makeReq('token userkey'));
    const second = await service.resolveCopilotToken(makeReq('Bearer userkey'));
    expect(first).toEqual(second);
    expect(github.fetchCopilotMeta).toHaveBeenCalledTimes(1);
  });

  it('refreshes when nearly expired (skew applied)', async () => {
    const soon = Date.now() + 30_000; // < skew (60s)
    github.fetchCopilotMeta.mockResolvedValueOnce({ token: 'A', expiresAt: soon });
    const first = await service.resolveCopilotToken(makeReq('Bearer userkey'));
    expect(first.token).toBe('A');

    // next call should fetch again since cache is not fresh
    github.fetchCopilotMeta.mockResolvedValueOnce({ token: 'B', expiresAt: Date.now() + 10 * 60_000 });
    const second = await service.resolveCopilotToken(makeReq('Bearer userkey'));
    expect(second.token).toBe('B');
    expect(github.fetchCopilotMeta).toHaveBeenCalledTimes(2);
  });

  it('deduplicates concurrent inflight requests', async () => {
    let resolveMeta: (v: any) => void;
    const p = new Promise<any>((r) => (resolveMeta = r));
    github.fetchCopilotMeta.mockReturnValue(p as any);

    const req = makeReq('Bearer userkey');
    const [p1, p2, p3] = [
      service.resolveCopilotToken(req),
      service.resolveCopilotToken(req),
      service.resolveCopilotToken(req),
    ];

    resolveMeta!({ token: 'A', expiresAt: Date.now() + 100_000 });
    const [r1, r2, r3] = await Promise.all([p1, p2, p3]);

    expect(r1).toEqual(r2);
    expect(r2).toEqual(r3);
    expect(github.fetchCopilotMeta).toHaveBeenCalledTimes(1);
  });
});
