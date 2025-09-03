import { useApiClient } from '_/hooks/useApiClient';
import { AxiosInstance } from 'axios';
import { ApiKeyResponse, CreateApiKeyDto } from '@/shared/types/api-key';

class ApiKeyService {
  static instance: ApiKeyService;
  static create(apiClient: AxiosInstance) {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService(apiClient);
    }
    return ApiKeyService.instance;
  }

  constructor(private readonly apiClient: AxiosInstance) {}

  async getApiKeys(): Promise<ApiKeyResponse[]> {
    const response = await this.apiClient.get('/api-keys');
    return response.data;
  }

  async createApiKey(request: CreateApiKeyDto): Promise<ApiKeyResponse> {
    const response = await this.apiClient.post('/api-keys', request);
    return response.data;
  }

  async updateApiKey(id: string, name: string): Promise<ApiKeyResponse> {
    const response = await this.apiClient.patch(`/api-keys/${id}`, { name });
    return response.data;
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.apiClient.delete(`/api-keys/${id}`);
  }

  async setDefaultApiKey(id: string): Promise<void> {
    await this.apiClient.post('/api-keys/default', { id });
  }

  async refreshApiKeyMeta(id: string): Promise<ApiKeyResponse> {
    const response = await this.apiClient.post(`/api-keys/${id}/refresh-meta`);
    return response.data;
  }

  startDeviceFlow(): EventSource {
    // The backend controller uses @Sse which is a GET request.
    return new EventSource(`/api/api-keys/device-flow`);
  }
}

export function useApiKeyService() {
  const api = useApiClient();
  return ApiKeyService.create(api);
}
