import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from '_/shared/api-keys';
import { Request, Response } from 'express';
import { ProxyService } from './proxy.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('chat/completions')
  async chatCompletions(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res);
  }

  @Get('models')
  async getModels(@Req() req: Request, @Res() res: Response) {
    return this.proxyService.proxyRequest(req, res);
  }
}
