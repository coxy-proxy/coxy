import { useApiClient } from '_/lib/api';
import { ApiKey, CreateApiKeyRequest } from '_/types/api-key';
import { AxiosInstance } from 'axios';

class ApiKeyService {
  static instance: ApiKeyService;
  static create(apiClient: AxiosInstance) {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService(apiClient);
    }
    return ApiKeyService.instance;
  }

  constructor(private readonly apiClient: AxiosInstance) {}

  async getApiKeys(): Promise<ApiKey[]> {
    const response = await this.apiClient.get('/api-keys');
    return response.data;
  }

  async createApiKey(request: CreateApiKeyRequest): Promise<ApiKey> {
    const response = await this.apiClient.post('/api-keys', request);
    return response.data;
  }

  async updateApiKey(id: string, name: string): Promise<ApiKey> {
    const response = await this.apiClient.patch(`/api-keys/${id}`, { name });
    return response.data;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.apiClient.delete(`/api-keys/${id}`);
  }

  async setDefaultApiKey(id: string): Promise<void> {
    await this.apiClient.post('/api-keys/default', { id });
  }

  startDeviceFlow(): EventSource {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    // The backend controller uses @Sse which is a GET request.
    return new EventSource(`${baseUrl}/api/api-keys/device-flow`);
  }
}

export function useApiKeyService() {
  const api = useApiClient();
  return ApiKeyService.create(api);
}
