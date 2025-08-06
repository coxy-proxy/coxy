export interface ApiKey {
  id: string;
  name: string;
  key: string; // Should be masked in UI
  created: Date;
  lastUsed?: Date;
  status: 'active' | 'disabled';
}
