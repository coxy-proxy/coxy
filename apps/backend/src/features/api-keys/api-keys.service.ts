import { Injectable, Logger } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { DeviceFlowSSEEvent } from './dto/device-flow-sse-event.dto';
import { GithubOauthService } from './github-oauth.service';
import { ApiKey, ApiKeyResponse } from './interfaces/api-key.interface';

function maskKey(key: string) {
  if (!key) {
    return '';
  }
  return `${key.slice(0, 10)}...${key.slice(-5)}`;
}

@Injectable()
export class ApiKeysService {
  private logger = new Logger(ApiKeysService.name);

  constructor(
    private readonly githubOauthService: GithubOauthService,
    private readonly fileStorageService: ApiKeysFileStorageService,
  ) {}

  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKey> {
    const apiKey = await this.fileStorageService.create(dto);
    apiKey.meta = await this.githubOauthService.fetchCopilotMeta(apiKey.key);

    return apiKey;
  }

  async listApiKeys(): Promise<ApiKeyResponse[]> {
    const apiKeys = await this.fileStorageService.findAll();
    // Return API keys without exposing the actual key values
    return apiKeys.map(({ key, ...apiKey }) => ({
      ...apiKey,
      maskedKey: maskKey(key),
    }));
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.fileStorageService.remove(id);
  }

  async validateApiKey(key: string): Promise<boolean> {
    const apiKeys = await this.fileStorageService.findAll();
    const apiKey = apiKeys.find((apiKey) => apiKey.key === key);
    return !!apiKey;
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
}
