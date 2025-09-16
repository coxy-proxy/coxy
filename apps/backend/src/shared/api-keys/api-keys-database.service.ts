import { Injectable, Logger } from '@nestjs/common';
import { ApiKey, CopilotMeta } from '@/shared/types/api-key';
import { PrismaService } from '../prisma/prisma.service';
import type { IApiKeysStorage } from './api-keys-storage.interface';

function toEpoch(date: Date | null | undefined): number | undefined {
  return date ? date.getTime() : undefined;
}

function toEpochNullable(date: Date | null | undefined): number | null {
  return date ? date.getTime() : null;
}

function fromEpoch(millis?: number | null): Date | undefined {
  if (millis === null || millis === undefined) return undefined;
  return new Date(millis);
}

@Injectable()
export class ApiKeysDatabaseService implements IApiKeysStorage {
  private readonly logger = new Logger(ApiKeysDatabaseService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create({ id, name, key, createdAt, lastUsed, usageCount, meta }: Partial<ApiKey>): Promise<ApiKey> {
    if (!name || !key) throw new Error('Missing required fields: name, key');

    const created = await this.prisma.apiKey.create({
      data: {
        id: id ?? undefined,
        name,
        key,
        createdAt: fromEpoch(createdAt) ?? undefined,
        lastUsed: fromEpoch(lastUsed),
        usageCount: usageCount ?? 0,
        meta: meta
          ? {
              create: {
                token: meta.token,
                expiresAt: new Date(meta.expiresAt),
                resetTime: fromEpoch(meta.resetTime) ?? null,
                chatQuota: meta.chatQuota ?? null,
                completionsQuota: meta.completionsQuota ?? null,
              },
            }
          : undefined,
      },
      include: { meta: true },
    });

    return this.map(created);
  }

  async findAll(): Promise<ApiKey[]> {
    const rows = await this.prisma.apiKey.findMany({ include: { meta: true } });
    return rows.map((r) => this.map(r));
  }

  async findOne(id: string): Promise<ApiKey | null> {
    const row = await this.prisma.apiKey.findUnique({ where: { id }, include: { meta: true } });
    return row ? this.map(row) : null;
  }

  async update(id: string, updates: Partial<ApiKey>): Promise<ApiKey> {
    const { name, key, lastUsed, usageCount, meta } = updates;

    const updated = await this.prisma.apiKey.update({
      where: { id },
      data: {
        name: name ?? undefined,
        key: key ?? undefined,
        lastUsed: fromEpoch(lastUsed),
        usageCount: usageCount ?? undefined,
        meta: meta
          ? {
              upsert: {
                create: {
                  token: meta.token,
                  expiresAt: new Date(meta.expiresAt),
                  resetTime: fromEpoch(meta.resetTime) ?? null,
                  chatQuota: meta.chatQuota ?? null,
                  completionsQuota: meta.completionsQuota ?? null,
                },
                update: {
                  token: meta.token,
                  expiresAt: new Date(meta.expiresAt),
                  resetTime: fromEpoch(meta.resetTime) ?? null,
                  chatQuota: meta.chatQuota ?? null,
                  completionsQuota: meta.completionsQuota ?? null,
                },
              },
            }
          : undefined,
      },
      include: { meta: true },
    });

    return this.map(updated);
  }

  async remove(id: string): Promise<void> {
    await this.prisma.apiKey.delete({ where: { id } });
  }

  async updateDefault(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.apiKey.updateMany({ data: { isDefault: false }, where: { isDefault: true } }),
      this.prisma.apiKey.update({ where: { id }, data: { isDefault: true } }),
    ]);
  }

  async getDefault(): Promise<ApiKey | null> {
    const row = await this.prisma.apiKey.findFirst({ where: { isDefault: true }, include: { meta: true } });
    return row ? this.map(row) : null;
  }

  private map(row: any): ApiKey {
    const meta = row.meta
      ? ({
          token: row.meta.token,
          expiresAt: toEpoch(row.meta.expiresAt)!,
          resetTime: toEpochNullable(row.meta.resetTime) ?? null,
          chatQuota: row.meta.chatQuota ?? null,
          completionsQuota: row.meta.completionsQuota ?? null,
        } satisfies CopilotMeta)
      : undefined;

    return {
      id: row.id,
      name: row.name,
      key: row.key,
      createdAt: toEpoch(row.createdAt)!,
      lastUsed: toEpoch(row.lastUsed),
      usageCount: row.usageCount,
      meta,
    } as ApiKey;
  }
}
