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

    const apiKey = authHeader?.replace(/^(token|Bearer) ?/, '') || EMPTY_KEY;
    // TODO: Implement default API key
    // const selectedToken = await getSelectedToken();
    // const oauthToken = apiKey === EMPTY_KEY ? selectedToken?.token : apiKey;
    // const oauthToken = apiKey;

    if (!apiKey) {
      throw new UnauthorizedException('Invalid authorization header');
    }
    this.logger.debug({ 'Use API key': maskKey(apiKey) });

    const validApiKey = await this.findApiKey(apiKey);

    if (!validApiKey) {
      throw new UnauthorizedException(`Invalid API key: ${apiKey}`);
    }

    // Add the validated API key to the request for later use
    request.apiKey = validApiKey;
    return true;
  }

  private async findApiKey(key: string): Promise<ApiKey | null> {
    const apiKeys = await this.fileStorageService.findAll();
    const apiKey = apiKeys.find((apiKey) => apiKey.key === key);
    return apiKey;
  }
}
