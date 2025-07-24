import { type CanActivate, type ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ApiKeysService } from '../../api-keys/api-keys.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private readonly apiKeysService: ApiKeysService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw new UnauthorizedException('Invalid authorization header');
    }

    const apiKey = authorization.substring(7); // Remove 'Bearer ' prefix
    const validApiKey = await this.apiKeysService.validateApiKey(apiKey);

    if (!validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Add the validated API key to the request for later use
    request.apiKey = validApiKey;
    return true;
  }
}
