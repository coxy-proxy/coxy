import { type CanActivate, type ExecutionContext, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { maskKey } from '_/shared/utils';
import { ApiKeysFileStorageService } from '../api-keys-file-storage.service';
import { ApiKey } from '../interfaces/api-key.interface';

const EMPTY_KEY = '_';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private logger = new Logger(ApiKeyGuard.name);

  constructor(private readonly fileStorageService: ApiKeysFileStorageService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const token: string = authHeader?.replace(/^(token|Bearer) ?/, '') || (await this.findDefaultToken());

    if (!token) {
      throw new UnauthorizedException(`Invalid authorization header: ${authHeader}`);
    }
    this.logger.debug({ 'Use API key': maskKey(token) });

    const validApiKey = await this.findApiKey(token);

    if (!validApiKey) {
      throw new UnauthorizedException(`Invalid API key: ${token}`);
    }

    // Add the validated API key to the request for later use
    request.apiKey = validApiKey;
    return true;
  }

  private async findDefaultToken(): Promise<string | null> {
    const apiKey = await this.fileStorageService.getDefault();
    return apiKey?.key || null;
  }

  private async findApiKey(key: string): Promise<ApiKey | null> {
    const apiKeys = await this.fileStorageService.findAll();
    const apiKey = apiKeys.find((apiKey) => apiKey.key === key);
    return apiKey;
  }
}
