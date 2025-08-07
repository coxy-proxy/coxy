import { apiClient } from '_/lib/api';
import { ApiKey, CreateApiKeyRequest } from '_/types/api-key';

export class ApiKeyService {
  static async getApiKeys(): Promise<ApiKey[]> {
    const response = await apiClient.get('/api-keys');
    return response.data;
  }

  static async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await apiClient.post('/api-keys', request);
    return response.data;
  }

  static async updateApiKey(id: string, name: string): Promise<ApiKey> {
    const response = await apiClient.patch(`/api-keys/${id}`, { name });
    return response.data;
  }

  static async deleteApiKey(id: string): Promise<void> {
    await apiClient.delete(`/api-keys/${id}`);
  }

  static async setDefaultApiKey(id: string): Promise<void> {
    await apiClient.post('/api-keys/default', { id });
  }

  static startDeviceFlow(): EventSource {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // The backend controller uses @Sse which is a GET request.
    return new EventSource(`${baseUrl}/api/api-keys/device-flow`);
  }
}
