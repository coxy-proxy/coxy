import type { ApiKeysFileStorageService } from '_/shared/api-keys';
import { of, Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ApiKey, ApiKeyResponse, CopilotMeta } from '@/shared/types/api-key';
import { maskKey } from '../../shared/utils';
import { ApiKeysService } from './api-keys.service';
import type { GithubOauthService } from './github-oauth.service';

function makeApiKey(partial: Partial<ApiKey> = {}): ApiKey {
  const key = partial.key ?? 'abcdefghijxxxxxxxxxxxxxxx12345'; // >= 15 chars for masking
  return {
    id: partial.id ?? 'id-' + Math.random().toString(36).slice(2),
    name: partial.name ?? 'My Key',
    key,
    createdAt: partial.createdAt ?? Date.now(),
    usageCount: partial.usageCount ?? 0,
    lastUsed: partial.lastUsed,
    meta: partial.meta,
  } as ApiKey;
}

describe('ApiKeysService', () => {
  let oauth: jest.Mocked<GithubOauthService> | any;
  let storage: jest.Mocked<ApiKeysFileStorageService> | any;
  let service: ApiKeysService;

  beforeEach(() => {
    oauth = {
      fetchCopilotMeta: vi.fn(),
      executeDeviceFlowWithPolling: vi.fn(),
    } as any;

    storage = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
      updateDefault: vi.fn(),
      getDefault: vi.fn(),
    } as any;

    service = new ApiKeysService(oauth, storage);
  });

  it('createApiKey: creates and enriches with meta; returns maskedKey', async () => {
    const created = makeApiKey({ id: '1', name: 'Key1' });
    storage.create.mockResolvedValue(created);

    const meta: CopilotMeta = {
      token: 'meta-token',
      expiresAt: 42,
      resetTime: null,
      chatQuota: 1,
      completionsQuota: 2,
    };
    oauth.fetchCopilotMeta.mockResolvedValue(meta);

    const res = await service.createApiKey({ name: created.name, key: created.key });

    expect(storage.create).toHaveBeenCalledWith({ name: created.name, key: created.key });
    expect(oauth.fetchCopilotMeta).toHaveBeenCalledWith(created.key);
    expect(res).toMatchObject<ApiKeyResponse>({
      id: '1',
      name: 'Key1',
      meta,
      isDefault: false,
      maskedKey: maskKey(created.key),
    });
  });

  it('createApiKey: sets meta to null when fetchCopilotMeta fails', async () => {
    const created = makeApiKey({ id: '1', name: 'Key1' });
    storage.create.mockResolvedValue(created);
    oauth.fetchCopilotMeta.mockRejectedValue(new Error('boom'));

    const res = await service.createApiKey({ name: created.name, key: created.key });
    expect(res.meta).toBeNull();
  });

  it('listApiKeys: returns sorted list with default flag', async () => {
    const k1 = makeApiKey({ id: '1', name: 'A', createdAt: 1000 });
    const k2 = makeApiKey({ id: '2', name: 'B', createdAt: 2000 });
    storage.findAll.mockResolvedValue([k1, k2]);
    storage.getDefault.mockResolvedValue(k1);

    const list = await service.listApiKeys();

    expect(list.map((k) => k.id)).toEqual(['2', '1']);
    const byId = Object.fromEntries(list.map((k) => [k.id, k] as const));
    expect(byId['2'].isDefault).toBe(false);
    expect(byId['1'].isDefault).toBe(true);
    expect(byId['1'].maskedKey).toBe(maskKey(k1.key));
  });

  it('updateApiKey: updates and returns response', async () => {
    const k1 = makeApiKey({ id: '1', name: 'Old' });
    storage.findOne.mockResolvedValue(k1);
    const updated = { ...k1, name: 'New' } as ApiKey;
    storage.update.mockResolvedValue(updated);

    const res = await service.updateApiKey('1', { name: 'New' });

    expect(storage.findOne).toHaveBeenCalledWith('1');
    expect(storage.update).toHaveBeenCalledWith('1', { name: 'New' });
    expect(res).toMatchObject<ApiKeyResponse>({ id: '1', name: 'New', maskedKey: maskKey(k1.key) });
  });

  it('updateApiKey: throws when key not found', async () => {
    storage.findOne.mockResolvedValue(null);
    await expect(service.updateApiKey('missing', { name: 'X' })).rejects.toThrow('API key not found');
  });

  it('deleteApiKey: calls remove', async () => {
    storage.remove.mockResolvedValue(undefined);
    await service.deleteApiKey('1');
    expect(storage.remove).toHaveBeenCalledWith('1');
  });

  it('refreshApiKeyMeta: updates meta and returns response', async () => {
    const k1 = makeApiKey({ id: '1' });
    storage.findOne.mockResolvedValue(k1);
    const meta: CopilotMeta = { token: 't', expiresAt: 1, resetTime: null, chatQuota: null, completionsQuota: null };
    oauth.fetchCopilotMeta.mockResolvedValue(meta);
    const updated = { ...k1, meta } as ApiKey;
    storage.update.mockResolvedValue(updated);

    const res = await service.refreshApiKeyMeta('1');

    expect(oauth.fetchCopilotMeta).toHaveBeenCalledWith(k1.key);
    expect(storage.update).toHaveBeenCalledWith('1', { meta });
    expect(res).toMatchObject<ApiKeyResponse>({ id: '1', meta, maskedKey: maskKey(k1.key) });
  });

  it('refreshApiKeyMeta: throws when key not found', async () => {
    storage.findOne.mockResolvedValue(null);
    await expect(service.refreshApiKeyMeta('missing')).rejects.toThrow('API key not found');
  });

  it('refreshApiKeyMeta: throws when fetch meta fails', async () => {
    const k1 = makeApiKey({ id: '1' });
    storage.findOne.mockResolvedValue(k1);
    oauth.fetchCopilotMeta.mockRejectedValue(new Error('network'));

    await expect(service.refreshApiKeyMeta('1')).rejects.toThrow('Failed to refresh Copilot meta');
  });

  it('executeDeviceFlowWithSSE: on success creates api key with access token', async () => {
    const now = 1700000000000;
    vi.setSystemTime(now);

    const subj = new Subject<any>();
    oauth.executeDeviceFlowWithPolling.mockReturnValue(subj.asObservable());

    const createSpy = vi.spyOn(service as any, 'createApiKey').mockResolvedValue({} as any);

    const events: any[] = [];
    const sub = service.executeDeviceFlowWithSSE().subscribe((e) => events.push(e));

    const successEvent = { type: 'success' as const, message: 'ok', accessToken: 'abc123' };
    subj.next({ type: 'initiated', message: 'start' });
    subj.next(successEvent);
    subj.complete();

    // Wait a tick for async tap
    await new Promise((r) => setTimeout(r, 0));

    expect(createSpy).toHaveBeenCalledWith({ name: `Key:${now}`, key: 'abc123' });

    sub.unsubscribe();
    vi.useRealTimers();
  });

  it('setDefaultApiKey: sets default and returns isDefault=true', async () => {
    const k1 = makeApiKey({ id: '1' });
    storage.findOne.mockResolvedValue(k1);
    storage.updateDefault.mockResolvedValue(undefined);

    const res = await service.setDefaultApiKey({ id: '1' });

    expect(storage.updateDefault).toHaveBeenCalledWith('1');
    expect(res.isDefault).toBe(true);
    expect(res.maskedKey).toBe(maskKey(k1.key));
  });
});
