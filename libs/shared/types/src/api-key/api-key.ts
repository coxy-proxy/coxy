export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
  meta?: CopilotMeta;
}

export interface CopilotMeta {
  token: string; // the actual token used for the chat completions API call
  expiresAt: number;
  resetTime: number | null;
  chatQuota: number | null;
  completionsQuota: number | null;
}

export interface ApiKeyResponse extends Omit<ApiKey, 'key'> {
  isDefault: boolean;
  maskedKey: string;
}
