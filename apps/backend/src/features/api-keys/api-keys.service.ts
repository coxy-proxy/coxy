import { Injectable, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { maskKey } from '../../shared/utils';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { DeviceFlowSSEEvent } from './dto/device-flow-sse-event.dto';
import { GithubOauthService } from './github-oauth.service';
import { ApiKey, ApiKeyResponse } from './interfaces/api-key.interface';

@Injectable()
export class ApiKeysService {
  private logger = new Logger(ApiKeysService.name);

  // TODO: Implement default API key
  private defaultApiKeyId = 'default';

  constructor(
    private readonly githubOauthService: GithubOauthService,
    private readonly fileStorageService: ApiKeysFileStorageService,
  ) {}

  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.fileStorageService.create(dto);
    apiKey.meta = await this.githubOauthService.fetchCopilotMeta(apiKey.key);

    return this.toApiKeyResponse(apiKey);
  }

  async listApiKeys(): Promise<ApiKeyResponse[]> {
    const apiKeys = await this.fileStorageService.findAll();
    // Return API keys without exposing the actual key values
    return apiKeys.map(this.toApiKeyResponse);
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.fileStorageService.remove(id);
  }

  async findApiKey(key: string): Promise<ApiKey | null> {
    const apiKeys = await this.fileStorageService.findAll();
    const apiKey = apiKeys.find((apiKey) => apiKey.key === key);
    return apiKey;
  }

  executeDeviceFlowWithSSE(): Observable<DeviceFlowSSEEvent> {
    return this.githubOauthService.executeDeviceFlowWithPolling().pipe(
      tap((event) => {
        event.type === 'success' && this.onDeviceFlowSuccess(event);
      }),
    );
  }

  private onDeviceFlowSuccess = (event: DeviceFlowSSEEvent) => {
    this.createApiKey({ name: `Key:${Date.now()}`, key: event.accessToken });
    this.logger.log('Stored API key by device flow');
  };

  private toApiKeyResponse = ({ key, ...partialKey }: ApiKey): ApiKeyResponse => ({
    ...partialKey,
    isDefault: partialKey.id === this.defaultApiKeyId,
    maskedKey: maskKey(key),
  });
}
