import type { HttpService } from '@nestjs/axios';
import type { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GithubOauthService } from './github-oauth.service';

function makeConfig() {
  return {
    deviceCodeApiUrl: 'https://github.com/login/device/code',
    oauthApiUrl: 'https://github.com/login/oauth/access_token',
    copilot_internal: { tokenApiUrl: 'https://api.github.com/copilot_internal/token' },
    copilot: { clientId: 'my-client-id' },
    headers: { 'content-type': 'application/json' },
  };
}

describe('GithubOauthService', () => {
  let http: jest.Mocked<HttpService> | any;
  let configService: jest.Mocked<ConfigService> | any;
  let service: GithubOauthService;

  beforeEach(() => {
    http = { get: vi.fn(), post: vi.fn() } as any;
    configService = { get: vi.fn().mockReturnValue(makeConfig()) } as any;
    service = new GithubOauthService(http, configService);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('fetchCopilotMeta', () => {
    it('returns mapped CopilotMeta on success with quotas and reset time', async () => {
      const config = makeConfig();
      configService.get.mockReturnValue(config);
      const tokenData = {
        token: 'copilot-token',
        expires_at: '2025-01-01T00:00:00.000Z',
        limited_user_quotas: { chat: 5, completions: 9 },
        limited_user_reset_date: 1735737600, // seconds -> ms
      };
      http.get.mockReturnValue(of({ data: tokenData }));

      const meta = await service.fetchCopilotMeta('abc');

      expect(http.get).toHaveBeenCalledWith(config.copilot_internal.tokenApiUrl, {
        headers: { Authorization: 'token abc' },
      });
      expect(meta).toEqual({
        token: 'copilot-token',
        expiresAt: new Date('2025-01-01T00:00:00.000Z').getTime(),
        resetTime: 1735737600 * 1000,
        chatQuota: 5,
        completionsQuota: 9,
      });
    });

    it('falls back when expires_at missing and no quotas/reset', async () => {
      const now = 1700000000000;
      vi.setSystemTime(now);
      const tokenData: any = {
        token: 'x',
        expires_at: undefined,
        limited_user_quotas: null,
        limited_user_reset_date: null,
      };
      http.get.mockReturnValue(of({ data: tokenData }));

      const meta = await service.fetchCopilotMeta('tk');

      expect(meta.token).toBe('x');
      expect(meta.expiresAt).toBe(now + 60 * 60 * 1000);
      expect(meta.resetTime).toBeNull();
      expect(meta.chatQuota).toBeNull();
      expect(meta.completionsQuota).toBeNull();
    });

    it('throws friendly error on failure', async () => {
      http.get.mockReturnValue(throwError(() => new Error('bad')));
      await expect(service.fetchCopilotMeta('k')).rejects.toThrow('Failed to get token details: bad');
    });
  });

  describe('executeDeviceFlowWithPolling', () => {
    it('emits initiated -> pending -> success and stops polling', async () => {
      vi.useFakeTimers();
      const config = makeConfig();
      configService.get.mockReturnValue(config);

      // First POST: initiate device flow
      let oauthVerifyCalls = 0;
      http.post.mockImplementation((url: string) => {
        if (url === config.deviceCodeApiUrl) {
          return of({
            data: {
              device_code: 'dev-code',
              user_code: 'user-code',
              verification_uri: 'https://verify',
              expires_in: 900,
              interval: 5,
            },
          });
        }
        // Subsequent POSTs: verify device flow. Return pending once then success
        oauthVerifyCalls++;
        if (oauthVerifyCalls === 1) {
          return of({ data: { error: 'authorization_pending' } });
        }
        return of({ data: { access_token: 'access-123' } });
      });

      const events: any[] = [];
      const sub = service.executeDeviceFlowWithPolling().subscribe((e) => events.push(e));

      // Allow initiateDeviceFlow to emit initiated immediately
      await Promise.resolve();
      // Trigger first polling tick -> pending
      vi.advanceTimersByTime(5500);
      await Promise.resolve();
      // Second polling tick -> success (and stop)
      vi.advanceTimersByTime(5500);
      await Promise.resolve();
      // Extra time should not cause more verify calls
      vi.advanceTimersByTime(20000);

      sub.unsubscribe();

      expect(events[0]).toMatchObject({ type: 'initiated', deviceCode: 'dev-code', userCode: 'user-code' });
      expect(events.some((e) => e.type === 'pending')).toBe(true);
      expect(events[events.length - 1]).toMatchObject({ type: 'success', accessToken: 'access-123' });

      // verify called at least twice (pending then success)
      const verifyCalls = http.post.mock.calls.filter(([u]: [string]) => u === config.oauthApiUrl).length;
      expect(verifyCalls).toBeGreaterThanOrEqual(2);
    });

    it('emits error event when polling throws', async () => {
      vi.useFakeTimers();
      const config = makeConfig();
      configService.get.mockReturnValue(config);

      http.post.mockImplementation((url: string) => {
        if (url === config.deviceCodeApiUrl) {
          return of({
            data: {
              device_code: 'dev-code',
              user_code: 'user-code',
              verification_uri: 'https://verify',
              expires_in: 900,
              interval: 5,
            },
          });
        }
        return throwError(() => new Error('boom'));
      });

      const events: any[] = [];
      const sub = service.executeDeviceFlowWithPolling().subscribe((e) => events.push(e));

      await Promise.resolve();
      vi.advanceTimersByTime(5500);
      await Promise.resolve();

      sub.unsubscribe();

      const errorEvent = events.find((e) => e.type === 'error');
      expect(errorEvent).toBeTruthy();
      expect(errorEvent.message).toContain('Failed to poll device authorization: boom');
    });

    it('maps oauth error response to error event without throwing', async () => {
      vi.useFakeTimers();
      const config = makeConfig();
      configService.get.mockReturnValue(config);

      http.post.mockImplementation((url: string) => {
        if (url === config.deviceCodeApiUrl) {
          return of({
            data: {
              device_code: 'dev-code',
              user_code: 'user-code',
              verification_uri: 'https://verify',
              expires_in: 900,
              interval: 5,
            },
          });
        }
        return of({ data: { error: 'access_denied', error_description: 'denied by user' } });
      });

      const events: any[] = [];
      const sub = service.executeDeviceFlowWithPolling().subscribe((e) => events.push(e));

      await Promise.resolve();
      vi.advanceTimersByTime(5500);
      await Promise.resolve();

      sub.unsubscribe();

      const err = events.find((e) => e.type === 'error');
      expect(err).toBeTruthy();
      expect(err.message).toContain('Error: denied by user');
    });
  });
});
