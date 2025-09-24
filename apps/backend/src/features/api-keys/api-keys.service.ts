import { ForbiddenException, Inject, Injectable, Logger } from '@nestjs/common';
import { API_KEYS_STORAGE, type IApiKeysStorage } from '_/shared/api-keys';
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
    @Inject(API_KEYS_STORAGE) private readonly storageService: IApiKeysStorage,
  ) {}

  async createApiKey(userId: string, dto: CreateApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.storageService.createForUser(userId, dto);
    apiKey.meta = await this.githubOauthService.fetchCopilotMeta(apiKey.key).catch(() => null);

    return this.toApiKeyResponse(apiKey);
  }

  async listApiKeys(userId: string): Promise<ApiKeyResponse[]> {
    const apiKeys = await this.storageService.findAllByUser(userId);
    this.defaultApiKeyId = (await this.storageService.getDefaultForUser(userId))?.id;

    // Sort by createdAt in descending order
    return apiKeys.map(this.toApiKeyResponse).sort((a, b) => b.createdAt - a.createdAt);
  }

  async updateApiKey(userId: string, id: string, dto: UpdateApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.storageService.findOne(id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    // ensure ownership
    const owned = (await this.storageService.findAllByUser(userId)).some((k) => k.id === id);
    if (!owned) throw new Error('Not your API key');
    const newKey = await this.storageService.update(id, dto);
    return this.toApiKeyResponse(newKey);
  }

  async deleteApiKey(userId: string, id: string): Promise<void> {
    const owned = (await this.storageService.findAllByUser(userId)).some((k) => k.id === id);
    if (!owned) throw new ForbiddenException('Not your API key');
    await this.storageService.remove(id);
  }

  async refreshApiKeyMeta(userId: string, id: string): Promise<ApiKeyResponse> {
    const apiKey = await this.storageService.findOne(id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    const owned = (await this.storageService.findAllByUser(userId)).some((k) => k.id === id);
    if (!owned) throw new ForbiddenException('Not your API key');

    const meta = await this.githubOauthService.fetchCopilotMeta(apiKey.key).catch((error) => {
      this.logger.warn(`Failed to refresh meta for key ${id}: ${error?.message ?? error}`);
      throw new Error('Failed to refresh Copilot meta');
    });

    const updated = await this.storageService.update(id, { meta });
    return this.toApiKeyResponse(updated);
  }

  executeDeviceFlowWithSSE(userId: string): Observable<DeviceFlowSSEEvent> {
    return this.githubOauthService.executeDeviceFlowWithPolling().pipe(
      tap((event) => {
        event.type === 'success' && this.onDeviceFlowSuccess(userId, event);
      }),
    );
  }

  async setDefaultApiKey(userId: string, dto: SetDefaultApiKeyDto): Promise<ApiKeyResponse> {
    const apiKey = await this.storageService.findOne(dto.id);
    if (!apiKey) {
      throw new Error('API key not found');
    }
    const owned = (await this.storageService.findAllByUser(userId)).some((k) => k.id === dto.id);
    if (!owned) throw new ForbiddenException('Not your API key');
    await this.storageService.updateDefaultForUser(userId, apiKey.id);
    this.defaultApiKeyId = apiKey.id;
    return this.toApiKeyResponse(apiKey);
  }

  private onDeviceFlowSuccess = (userId: string, event: DeviceFlowSSEEvent) => {
    this.createApiKey(userId, { name: `Key:${Date.now()}`, key: event.accessToken });
    this.logger.log('Stored API key by device flow');
  };

  private toApiKeyResponse = ({ key, ...partialKey }: ApiKey): ApiKeyResponse => ({
    ...partialKey,
    isDefault: partialKey.id === this.defaultApiKeyId,
    maskedKey: maskKey(key),
  });
}
