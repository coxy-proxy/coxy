import { Body, Controller, Get, HttpException, HttpStatus, Post, Request, UseGuards } from '@nestjs/common';
import { ChatCompletionDto } from './dto/chat-completion.dto';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ProxyService } from './proxy.service';

@Controller()
@UseGuards(ApiKeyGuard)
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post('chat/completions')
  async chatCompletions(@Body() body: ChatCompletionDto, @Request() req: any) {
    try {
      // API key is already validated by the guard and available in req.apiKey
      return await this.proxyService.forwardToCopilot(body, req.apiKey.key);
    } catch (error) {
      if (error.message === 'Malformed request') {
        throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
      }
      throw error;
    }
  }

  @Get('models')
  async getModels(@Request() req: any) {
    // API key is already validated by the guard
    return await this.proxyService.getAvailableModels();
  }
}
