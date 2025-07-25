export interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsedAt: string;
  usage: number;
  isDefault: boolean;
}
