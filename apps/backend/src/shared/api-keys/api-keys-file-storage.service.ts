import { Injectable, Logger } from '@nestjs/common';
import storage from 'node-persist';
import { v4 as uuid } from 'uuid';
import { ApiKey } from '@/shared/types/api-key';

const STORAGE_DIR = process.env.STORAGE_DIR || '.storage';

const tokenStorage = storage.create({
  dir: `${STORAGE_DIR}/tokens`,
  ttl: false, // tokens never expire by default
});

const selectedTokenStorage = storage.create({
  dir: `${STORAGE_DIR}/selected-token`,
  ttl: false, // tokens never expire by default
});

await tokenStorage.init();
await selectedTokenStorage.init();

@Injectable()
export class ApiKeysFileStorageService {
  private readonly logger = new Logger(ApiKeysFileStorageService.name);

  async create({ id, name, key }: Partial<ApiKey>): Promise<ApiKey> {
    const item = id ? await tokenStorage.getItem(id) : { id: uuid(), name, key, createdAt: Date.now(), usageCount: 0 };
    await tokenStorage.setItem(item.id, { ...item, name, key });
    const apiKey = await tokenStorage.getItem(item.id);
    this.logger.log('Created API key:', apiKey);
    return apiKey;
  }

  async findAll(): Promise<ApiKey[]> {
    return (await tokenStorage.values()) || [];
  }

  async findOne(id: ApiKey['id']): Promise<ApiKey | null> {
    return await tokenStorage.getItem(id);
  }

  async update(id: ApiKey['id'], apiKey: Partial<ApiKey>) {
    const item = await tokenStorage.getItem(id);
    if (!item) {
      throw new Error('Token not found');
    }
    await tokenStorage.setItem(item.id, { ...item, ...apiKey });
  }

  async remove(id: ApiKey['id']) {
    await tokenStorage.removeItem(id);
  }

  async updateDefault(id: ApiKey['id']) {
    await selectedTokenStorage.setItem('selected-token-id', id);
  }

  async getDefault(): Promise<ApiKey | null> {
    const id = await selectedTokenStorage.getItem('selected-token-id');
    return id ? await tokenStorage.getItem(id) : null;
  }
}
