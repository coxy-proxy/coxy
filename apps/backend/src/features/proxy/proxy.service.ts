import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { toHeaders } from '_/shared/utils';
import * as config from 'config';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { TokenResolverService } from './token-resolver.service';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly copilotApiUrl = config.get<string>('github.copilot.copilotApiUrl');

  private readonly globalPrefix = config.get<string>('api.prefix');

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenResolver: TokenResolverService,
  ) {}

  async proxyRequest(req: Request, res: Response) {
    const originalUrl = req.originalUrl.replace(this.globalPrefix, '').replace('//', '/');
    const targetUrl = new URL(originalUrl, this.copilotApiUrl);

    try {
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body;

      const headers = {
        ...toHeaders(req.headers),
        ...config.get<Record<string, string>>('github.copilot.headers'),
      } as Record<string, string>;

      const pathname = targetUrl.pathname;
      const isChatCompletions = pathname === '/chat/completions' || pathname.startsWith('/chat/completions');
      if (isChatCompletions) {
        const { token } = await this.tokenResolver.resolveCopilotToken(req);
        headers.authorization = `Bearer ${token}`;
      }

      const copilotResponse = await lastValueFrom(
        this.httpService.request({
          method: req.method,
          url: targetUrl.href,
          data: body,
          headers,
          responseType: 'stream',
        }),
      );

      res.setHeader('Content-Type', copilotResponse.headers['content-type']);
      copilotResponse.data.pipe(res);
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.message || 'Internal Server Error';
      this.logger.error(`Error proxying request to Copilot: ${error.message}`, message, error.stack);
      res.status(status).json({ message });
    }
  }
}
