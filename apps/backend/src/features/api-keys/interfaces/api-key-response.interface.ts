import { ApiKey } from '_/shared/api-keys';

export interface ApiKeyResponse extends Omit<ApiKey, 'key'> {
  isDefault: boolean;
  maskedKey: string;
}
