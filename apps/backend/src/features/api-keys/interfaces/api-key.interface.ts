export interface ApiKey {
  id: string;
  name: string;
  key: string;
  isActive: boolean;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}
