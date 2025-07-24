import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Observable } from 'rxjs';
import { DeviceFlowSSEEvent } from './dto/device-flow-sse-event.dto';
import { GithubOauthService } from './github-oauth.service';
import { ApiKey } from './interfaces/api-key.interface';

@Injectable()
export class ApiKeysService {
  private apiKeys: ApiKey[] = []; // TODO: Replace with database storage

  constructor(private readonly githubOauthService: GithubOauthService) {}

  async createApiKey(name: string): Promise<ApiKey> {
    const apiKey: ApiKey = {
      id: this.generateId(),
      name,
      key: this.generateApiKey(),
      isActive: true,
      createdAt: new Date(),
      usageCount: 0,
    };

    this.apiKeys.push(apiKey);
    return apiKey;
  }

  async listApiKeys(): Promise<Omit<ApiKey, 'key'>[]> {
    // Return API keys without exposing the actual key values
    return this.apiKeys.map(({ key, ...apiKey }) => ({
      ...apiKey,
      keyPreview: `${key.substring(0, 8)}...${key.substring(key.length - 4)}`,
    }));
  }

  async deleteApiKey(id: string): Promise<void> {
    const index = this.apiKeys.findIndex((key) => key.id === id);
    if (index === -1) {
      throw new Error('API key not found');
    }
    this.apiKeys.splice(index, 1);
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const apiKey = this.apiKeys.find((k) => k.key === key && k.isActive);
    if (apiKey) {
      // Update usage statistics
      apiKey.usageCount++;
      apiKey.lastUsed = new Date();
    }
    return apiKey || null;
  }

  executeDeviceFlowWithSSE(): Observable<DeviceFlowSSEEvent> {
    return this.githubOauthService.executeDeviceFlowWithPolling();
  }

  private generateApiKey(): string {
    return `sk-${randomBytes(32).toString('hex')}`;
  }

  private generateId(): string {
    return randomBytes(16).toString('hex');
  }
}
