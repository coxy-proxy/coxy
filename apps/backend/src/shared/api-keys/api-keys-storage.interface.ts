import { ApiKey } from '@/shared/types/api-key';

export interface IApiKeysStorage {
  create(apiKey: Partial<ApiKey>): Promise<ApiKey>;
  createForUser(userId: string, apiKey: Partial<ApiKey>): Promise<ApiKey>;
  findAll(): Promise<ApiKey[]>;
  findAllByUser(userId: string): Promise<ApiKey[]>;
  findOne(id: ApiKey['id']): Promise<ApiKey | null>;
  findByKey(key: string): Promise<ApiKey | null>;
  update(id: ApiKey['id'], apiKey: Partial<ApiKey>): Promise<ApiKey>;
  remove(id: ApiKey['id']): Promise<void>;
  updateDefault(id: ApiKey['id']): Promise<void>;
  updateDefaultForUser(userId: string, id: ApiKey['id']): Promise<void>;
  getDefault(): Promise<ApiKey | null>;
  getDefaultForUser(userId: string): Promise<ApiKey | null>;
}
