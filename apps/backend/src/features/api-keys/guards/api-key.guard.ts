import {
  type CanActivate,
  type ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { API_KEYS_STORAGE, type IApiKeysStorage } from '_/shared/api-keys';
import { maskKey } from '_/shared/utils';
import { ApiKey } from '@/shared/types/api-key';

const EMPTY_KEY = '_';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private logger = new Logger(ApiKeyGuard.name);

  constructor(@Inject(API_KEYS_STORAGE) private readonly storageService: IApiKeysStorage) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    const providedToken = authHeader?.replace(/^(token|Bearer) ?/, '') || EMPTY_KEY;
    const defaultToken = await this.findDefaultToken();
    const token = providedToken === EMPTY_KEY ? defaultToken : providedToken;

    if (!token) {
      throw new UnauthorizedException(`Invalid authorization header: ${authHeader}`);
    }
    this.logger.debug({ 'Use API key': maskKey(token) });

    const validApiKey = await this.findApiKey(token);

    if (!validApiKey) {
      throw new UnauthorizedException(`Invalid API key: ${token}`);
    }

    request.headers.authorization = `Bearer ${validApiKey.key}`;
    return true;
  }

  private async findDefaultToken(): Promise<string | null> {
    const apiKey = await this.storageService.getDefault();
    return apiKey?.key || null;
  }

  private async findApiKey(key: string): Promise<ApiKey | null> {
    const apiKeys = await this.storageService.findAll();
    const apiKey = apiKeys.find((apiKey) => apiKey.key === key);
    return apiKey;
  }
}
