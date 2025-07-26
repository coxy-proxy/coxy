export interface ApiKey {
  id: string;
  name: string;
  key: string;
  isDefault: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

export interface ApiKeyResponse extends Omit<ApiKey, 'key'> {
  isDefault: boolean;
  maskedKey: string;
}
