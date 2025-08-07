export interface ApiKey {
  id: string;
  name: string;
  key: string; // Full key (masked in UI)
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isDefault: boolean;
  quota?: {
    used: number;
    limit: number;
    renewAt: Date; // When quota will be renewed
  };
}

export interface CreateApiKeyRequest {
  name: string;
  key?: string; // Optional for manual entry
}
