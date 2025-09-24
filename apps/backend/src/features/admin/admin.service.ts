import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '_/shared/prisma/prisma.service';
import { maskKey } from '_/shared/utils';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly auth: AuthService,
    private readonly prisma: PrismaService,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    // Reuse AuthService login and enforce ADMIN role
    const result = await this.auth.login(email, password);
    const role = (result.user as any)?.role || 'USER';
    if (role !== 'ADMIN') throw new UnauthorizedException('Admin access required');
    return { access_token: result.accessToken };
  }

  async getUsageStatistics(): Promise<any> {
    const [totalUsers, totalApiKeys, activeApiKeys, defaultKeys] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.apiKey.count(),
      this.prisma.apiKey.count({ where: { usageCount: { gt: 0 } } }),
      this.prisma.apiKey.count({ where: { isDefault: true } }),
    ]);

    return {
      totalUsers,
      totalApiKeys,
      activeApiKeys,
      defaultKeys,
      // Placeholders for future telemetry
      requestsToday: 0,
      requestsThisWeek: 0,
      requestsThisMonth: 0,
      averageResponseTime: null,
      errorRate: null,
      topModels: [],
    };
  }

  async getRequestLogs(): Promise<any> {
    // Not implemented yet; return empty structure
    return { logs: [], total: 0, page: 1, limit: 50 };
  }

  async listUsers(skip = 0, take = 50) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({ skip, take, orderBy: { createdAt: 'desc' } }),
      this.prisma.user.count(),
    ]);
    return {
      total,
      skip,
      take,
      users: users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, createdAt: u.createdAt })),
    };
  }

  async getUserById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new UnauthorizedException('User not found');

    const [keys, defaultKey] = await Promise.all([
      this.prisma.apiKey.findMany({ where: { userId: id }, include: { meta: true } }),
      this.prisma.apiKey.findFirst({ where: { userId: id, isDefault: true }, include: { meta: true } }),
    ]);

    const defaultId = defaultKey?.id;
    const apiKeys = keys
      .map((k) => ({
        id: k.id,
        name: k.name,
        createdAt: k.createdAt.getTime(),
        lastUsed: k.lastUsed ? k.lastUsed.getTime() : undefined,
        usageCount: k.usageCount,
        maskedKey: maskKey(k.key),
        isDefault: k.id === defaultId,
        meta: k.meta
          ? {
              token: k.meta.token,
              expiresAt: k.meta.expiresAt.getTime(),
              resetTime: k.meta.resetTime ? k.meta.resetTime.getTime() : null,
              chatQuota: k.meta.chatQuota ?? null,
              completionsQuota: k.meta.completionsQuota ?? null,
            }
          : undefined,
      }))
      .sort((a, b) => b.createdAt - a.createdAt);

    return { user: { id: user.id, email: user.email, name: user.name, role: user.role }, apiKeys };
  }

  async updateUser(id: string, dto: { name?: string; role?: 'USER' | 'ADMIN' }) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { name: dto.name ?? undefined, role: dto.role ?? undefined },
    });
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
  }

  async deleteUser(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
