import { createHash } from 'node:crypto';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from './auth.service';

const mockPrisma = () => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    create: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
    update: vi.fn(),
  },
});

const mockJwt = () => ({
  signAsync: vi.fn(),
});

const mockConfig = (overrides: Record<string, any> = {}) => ({
  get: vi.fn((key: string) => {
    const map: Record<string, any> = {
      'jwt.accessSecret': 'access-secret',
      'jwt.refreshSecret': 'refresh-secret',
      'jwt.accessTtl': '15m',
      'jwt.refreshTtl': '7d',
      ...overrides,
    };
    return map[key];
  }),
});

// Mock bcrypt to avoid expensive hashing
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn(async () => 'hashed'),
    compare: vi.fn(async () => true),
  },
  hash: vi.fn(async () => 'hashed'),
  compare: vi.fn(async () => true),
}));

describe('AuthService', () => {
  let prisma: ReturnType<typeof mockPrisma>;
  let jwt: ReturnType<typeof mockJwt>;
  let config: ReturnType<typeof mockConfig>;
  let service: AuthService;

  beforeEach(() => {
    vi.useFakeTimers();
    prisma = mockPrisma();
    jwt = mockJwt();
    config = mockConfig();
    // @ts-expect-error - partial mocks are fine for tests
    service = new AuthService(jwt as any, config as any, prisma as any);
  });

  it('register: creates user, issues tokens, stores hashed refresh token', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({ id: 'u1', email: 'e', name: 'n' });
    jwt.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');

    const out = await service.register({ email: 'e', password: 'p', name: 'n' });

    expect(prisma.user.create).toHaveBeenCalled();
    const tokenHash = createHash('sha256').update('refresh').digest('hex');
    expect(prisma.refreshToken.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ tokenHash, userId: 'u1' }) }),
    );
    expect(out.user).toMatchObject({ id: 'u1', email: 'e', name: 'n' });
    // tokens are included in service response for controller to set cookies
    // @ts-expect-error in service response shape
    expect(out.accessToken).toBe('access');
    // @ts-expect-error in service response shape
    expect(out.refreshToken).toBe('refresh');
  });

  it('register: throws on duplicate email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 'u1' });
    await expect(service.register({ email: 'e', password: 'p' })).rejects.toBeInstanceOf(BadRequestException);
  });

  it('login: succeeds with correct password', async () => {
    // @ts-ignore using mocked bcrypt.compare (true)
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'e', name: 'n', passwordHash: 'hashed', role: 'USER' });
    jwt.signAsync.mockResolvedValueOnce('access').mockResolvedValueOnce('refresh');

    const out = await service.login('e', 'p');
    expect(out.user).toMatchObject({ id: 'u1', email: 'e', name: 'n' });
    // @ts-expect-error tokens present in service return
    expect(out.accessToken).toBe('access');
  });

  it('login: throws Unauthorized on invalid password', async () => {
    // Force bcrypt.compare to false
    (bcrypt.compare as any).mockResolvedValueOnce(false);
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'e', name: 'n', passwordHash: 'hashed', role: 'USER' });
    await expect(service.login('e', 'wrong')).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('refresh: deletes old refresh token (rotation), issues new tokens', async () => {
    jwt.signAsync.mockResolvedValueOnce('new-access').mockResolvedValueOnce('new-refresh');
    prisma.user.findUnique.mockResolvedValue({ id: 'u1', email: 'e', name: 'n', role: 'USER' });
    prisma.refreshToken.delete.mockResolvedValue(undefined);

    const out = await service.refresh('u1', 'old-refresh');
    const tokenHash = createHash('sha256').update('old-refresh').digest('hex');
    expect(prisma.refreshToken.delete).toHaveBeenCalledWith({ where: { tokenHash } });
    // new refresh stored via issueTokens
    expect(prisma.refreshToken.create).toHaveBeenCalled();
    // @ts-expect-error tokens present in service return
    expect(out.accessToken).toBe('new-access');
  });

  it('logout: revokes refresh token best-effort', async () => {
    prisma.refreshToken.update.mockResolvedValue(undefined);
    await service.logout('r1');
    expect(prisma.refreshToken.update).toHaveBeenCalled();

    prisma.refreshToken.update.mockRejectedValueOnce(new Error('nope'));
    await service.logout('r2');
  });

  it('updateProfile: updates user name', async () => {
    prisma.user.update.mockResolvedValue({ id: 'u1', email: 'e', name: 'new' });
    const out = await service.updateProfile('u1', { name: 'new' });
    expect(out.user).toMatchObject({ id: 'u1', name: 'new' });
  });

  it('cookie helpers: setAuthCookies and clearAuthCookies', async () => {
    const res: any = { cookie: vi.fn(), clearCookie: vi.fn() };
    service.setAuthCookies(res, { accessToken: 'a', refreshToken: 'r' });
    expect(res.cookie).toHaveBeenCalledWith(
      'access_token',
      'a',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    expect(res.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'r',
      expect.objectContaining({ httpOnly: true, path: '/' }),
    );
    service.clearAuthCookies(res);
    expect(res.clearCookie).toHaveBeenCalledWith('access_token', expect.any(Object));
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', expect.any(Object));
  });
});
