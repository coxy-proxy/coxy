import { apiClient } from '_/lib/api';
import { ApiKey, CreateApiKeyRequest } from '_/types/api-key';

const mockApiKeys: ApiKey[] = [
  {
    id: '1',
    name: 'Production Key',
    key: 'sk-prod-abcdef1234567890',
    createdAt: new Date('2023-01-15'),
    lastUsed: new Date('2023-08-01'),
    usageCount: 1204,
    isDefault: true,
    quota: { used: 1204, limit: 10000, renewAt: new Date('2023-09-01') },
  },
  {
    id: '2',
    name: 'Staging Key',
    key: 'sk-stage-fedcba0987654321',
    createdAt: new Date('2023-03-20'),
    lastUsed: new Date('2023-07-25'),
    usageCount: 543,
    isDefault: false,
    quota: { used: 543, limit: 5000, renewAt: new Date('2023-09-01') },
  },
  {
    id: '3',
    name: 'GitHub Generated Key',
    key: 'gho_abcdefghijklmnopqrstuvwxyz123456',
    createdAt: new Date('2023-06-10'),
    lastUsed: undefined,
    usageCount: 0,
    isDefault: false,
    quota: { used: 0, limit: 1000, renewAt: new Date('2023-09-10') },
  },
];

export class ApiKeyService {
  static async getApiKeys(): Promise<ApiKey[]> {
    console.log('Fetching API keys');
    // In a real app, this would be:
    // const response = await apiClient.get('/api-keys');
    // return response.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    return Promise.resolve(mockApiKeys);
  }

  static async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    console.log('Creating API key', request);
    // const response = await apiClient.post('/api-keys', request);
    // return response.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    const newKey: ApiKey = {
      id: Math.random().toString(36).substring(2, 15),
      name: request.name,
      key: request.key || `sk-mock-${Math.random().toString(36).substring(2, 15)}`,
      createdAt: new Date(),
      usageCount: 0,
      isDefault: false,
      quota: { used: 0, limit: 1000, renewAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    };
    mockApiKeys.push(newKey);
    return Promise.resolve(newKey);
  }

  static async updateApiKey(id: string, name: string): Promise<ApiKey> {
    console.log(`Updating API key ${id} with name ${name}`);
    // const response = await apiClient.patch(`/api-keys/${id}`, { name });
    // return response.data;
    await new Promise((resolve) => setTimeout(resolve, 500));
    const keyToUpdate = mockApiKeys.find((k) => k.id === id);
    if (keyToUpdate) {
      keyToUpdate.name = name;
      return Promise.resolve(keyToUpdate);
    }
    return Promise.reject('Key not found');
  }

  static async deleteApiKey(id: string): Promise<void> {
    console.log(`Deleting API key ${id}`);
    // await apiClient.delete(`/api-keys/${id}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockApiKeys.findIndex((k) => k.id === id);
    if (index > -1) {
      mockApiKeys.splice(index, 1);
      return Promise.resolve();
    }
    return Promise.reject('Key not found');
  }

  static async setDefaultApiKey(id: string): Promise<void> {
    console.log(`Setting default API key to ${id}`);
    // await apiClient.post(`/api-keys/default`, { id });
    await new Promise((resolve) => setTimeout(resolve, 500));
    mockApiKeys.forEach((k) => {
      k.isDefault = k.id === id;
    });
    return Promise.resolve();
  }

  static async startDeviceFlow(): Promise<EventSource> {
    console.log('Starting device flow');
    // This is a complex mock. We'll simulate the SSE events.
    // const response = await apiClient.post('/api-keys/device-flow');
    // return new EventSource(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/api-keys/device-flow/${response.data.sessionId}`);

    // For now, returning a mock that does nothing.
    // This will be implemented properly later.
    return new EventSource('data:text/event-stream,');
  }
}
