import { CopilotMeta } from '@/shared/types/api-key';

export interface ApiKey {
  id: string;
  name: string;
  maskedKey: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  isDefault: boolean;
  meta?: CopilotMeta;
}

export interface CreateApiKeyRequest {
  name: string;
  key?: string;
}
