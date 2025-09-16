import { ApiKey } from '@/shared/types/api-key';

export interface IApiKeysStorage {
  create(apiKey: Partial<ApiKey>): Promise<ApiKey>;
  findAll(): Promise<ApiKey[]>;
  findOne(id: ApiKey['id']): Promise<ApiKey | null>;
  update(id: ApiKey['id'], apiKey: Partial<ApiKey>): Promise<ApiKey>;
  remove(id: ApiKey['id']): Promise<void>;
  updateDefault(id: ApiKey['id']): Promise<void>;
  getDefault(): Promise<ApiKey | null>;
}
