import { Injectable, Logger } from '@nestjs/common';
import { ApiKeysFileStorageService } from '_/shared/api-keys';
import { Observable, tap } from 'rxjs';
import {
  ApiKey,
  ApiKeyResponse,
  CreateApiKeyDto,
  DeviceFlowSSEEvent,
  SetDefaultApiKeyDto,
  UpdateApiKeyDto,
} from '@/shared/types/api-key';
import { maskKey } from '../../shared/utils';
import { GithubOauthService } from './github-oauth.service';

@Injectable()
export class ApiKeysService {
  private logger = new Logger(ApiKeysService.name);

  private defaultApiKeyId = null;

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
    this.defaultApiKeyId = (await this.fileStorageService.getDefault())?.id;

    // Sort by createdAt in descending order
    return apiKeys.map(this.toApiKeyResponse).sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateApiKey(id: string, dto: UpdateApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.fileStorageService.findOne(id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    const newKey = await this.fileStorageService.update(id, dto);
    return this.toApiKeyResponse(newKey);
  }

  async deleteApiKey(id: string): Promise<void> {
    await this.fileStorageService.remove(id);
  }

  executeDeviceFlowWithSSE(): Observable<DeviceFlowSSEEvent> {
    return this.githubOauthService.executeDeviceFlowWithPolling().pipe(
      tap((event) => {
        event.type === 'success' && this.onDeviceFlowSuccess(event);
      }),
    );
  }

  async setDefaultApiKey(dto: SetDefaultApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.fileStorageService.findOne(dto.id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    await this.fileStorageService.updateDefault(apiKey.id);
    this.defaultApiKeyId = apiKey.id;
    return this.toApiKeyResponse(apiKey);
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
