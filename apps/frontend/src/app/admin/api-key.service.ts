import { Injectable, signal } from '@angular/core';
import type { ApiKey } from './api-key.interface';

@Injectable({
  providedIn: 'root',
})
export class ApiKeyService {
  private readonly initialKeys: ApiKey[] = [
    {
      id: '1',
      name: 'Production Client',
      key: 'ghu_1234...abcd',
      createdAt: '2024-01-10',
      lastUsedAt: '2 min ago',
      usage: 847,
      isDefault: true,
    },
    {
      id: '2',
      name: 'Development',
      key: 'ghu_5678...efgh',
      createdAt: '2024-01-08',
      lastUsedAt: '5 min ago',
      usage: 203,
      isDefault: false,
    },
    {
      id: '3',
      name: 'Testing Key',
      key: 'ghu_9999...xyza',
      createdAt: '2024-01-15',
      lastUsedAt: '15 min ago',
      usage: 12,
      isDefault: false,
    },
    {
      id: '4',
      name: 'Legacy Client',
      key: 'ghu_old1...dead',
      createdAt: '2023-12-01',
      lastUsedAt: '30 days ago',
      usage: 1456,
      isDefault: false,
    },
    {
      id: '5',
      name: 'Mobile App',
      key: 'ghu_mob1...app1',
      createdAt: '2024-01-05',
      lastUsedAt: 'Never',
      usage: 0,
      isDefault: false,
    },
  ];

  private keys = signal<ApiKey[]>(this.initialKeys);

  keys$ = this.keys.asReadonly();

  addKey(key: Omit<ApiKey, 'id' | 'createdAt' | 'lastUsedAt' | 'usage' | 'isDefault'>) {
    const newKey: ApiKey = {
      ...key,
      id: Math.random().toString(36).substring(2),
      createdAt: 'Just now',
      lastUsedAt: 'Never',
      usage: 0,
      isDefault: false,
    };
    this.keys.update((keys) => [newKey, ...keys]);
  }

  updateKey(id: string, name: string) {
    this.keys.update((keys) => keys.map((key) => (key.id === id ? { ...key, name } : key)));
  }

  deleteKey(id: string) {
    this.keys.update((keys) => keys.filter((key) => key.id !== id));
  }

  setDefault(id: string) {
    this.keys.update((keys) => keys.map((key) => ({ ...key, isDefault: key.id === id })));
  }
}
