import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Observable } from 'rxjs';
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
  constructor(
    private readonly githubOauthService: GithubOauthService,
    private readonly fileStorageService: ApiKeysFileStorageService,
  ) {}

  async createApiKey(dto: CreateApiKeyDto): Promise<ApiKey> {
    return this.fileStorageService.create(dto);
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
    return this.githubOauthService.executeDeviceFlowWithPolling();
  }
}
