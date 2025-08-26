import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { GithubOauthService } from '../api-keys/github-oauth.service';

@Injectable()
export class TokenResolverService {
  private readonly logger = new Logger(TokenResolverService.name);

  constructor(private readonly githubOauth: GithubOauthService) {}

  private tokenCache = new Map<string, { token: string; expiresAt: number }>();
  private inflight = new Map<string, Promise<{ token: string; expiresAt: number }>>();
  private readonly skewMs = 60_000;

  private cacheKeyFromUserKey(userKey: string) {
    // Minimal: avoid storing raw key by hashing. In a real system, use HMAC with a secret.
    return Buffer.from(userKey).toString('base64');
  }

  private isFresh(entry?: { token: string; expiresAt: number }) {
    if (!entry) return false;
    return entry.expiresAt - this.skewMs > Date.now();
  }

  async resolveCopilotToken(req: Request) {
    const userAuth = req.headers.authorization;
    const userKey = typeof userAuth === 'string' ? userAuth.replace(/^(Bearer|token)\s+/i, '') : '';
    if (!userKey) {
      throw new UnauthorizedException('Missing API key');
    }

    const key = this.cacheKeyFromUserKey(userKey);
    const cached = this.tokenCache.get(key);
    if (this.isFresh(cached)) return cached;

    const inflightExisting = this.inflight.get(key);
    if (inflightExisting) return inflightExisting;

    this.logger.debug('Resolving github copilot token');
    const p = this.githubOauth
      .fetchCopilotMeta(userKey)
      .then((meta) => {
        const entry = { token: meta.token, expiresAt: meta.expiresAt };
        this.tokenCache.set(key, entry);
        return entry;
      })
      .finally(() => this.inflight.delete(key));

    this.inflight.set(key, p);
    return p;
  }
}
