import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiKeysDatabaseService } from './api-keys-database.service';

const mockPrisma = () => ({
  apiKey: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    updateMany: vi.fn(),
    findFirst: vi.fn(),
  },
  $transaction: vi.fn((ops: any) => Promise.all(ops)),
});

describe('ApiKeysDatabaseService', () => {
  let svc: ApiKeysDatabaseService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(() => {
    prisma = mockPrisma();
    // @ts-expect-error - partial mock
    svc = new ApiKeysDatabaseService(prisma);
  });

  it('maps created record to ApiKey with epoch millis', async () => {
    const now = new Date();
    prisma.apiKey.create.mockResolvedValue({
      id: 'id1',
      name: 'n',
      key: 'k',
      createdAt: now,
      lastUsed: null,
      usageCount: 0,
      meta: null,
    });
    const out = await svc.create({ name: 'n', key: 'k' });
    expect(out).toMatchObject({ id: 'id1', name: 'n', key: 'k', createdAt: now.getTime() });
  });

  it('upserts meta on update', async () => {
    const now = Date.now();
    prisma.apiKey.update.mockResolvedValue({
      id: 'id1',
      name: 'n',
      key: 'k',
      createdAt: new Date(now),
      lastUsed: null,
      usageCount: 0,
      meta: { token: 't', expiresAt: new Date(now + 1000), resetTime: null, chatQuota: null, completionsQuota: null },
    });

    const out = await svc.update('id1', {
      meta: { token: 't', expiresAt: now + 1000, resetTime: null, chatQuota: null, completionsQuota: null },
    });
    expect(out.meta?.token).toBe('t');
  });

  it('transactionally updates default key', async () => {
    prisma.apiKey.updateMany.mockResolvedValue({ count: 1 } as any);
    prisma.apiKey.update.mockResolvedValue({} as any);
    await svc.updateDefault('id1');
    expect(prisma.$transaction).toHaveBeenCalled();
  });
});
