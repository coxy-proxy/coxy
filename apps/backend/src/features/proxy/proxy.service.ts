import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { ApiKeysService } from '../api-keys/api-keys.service';

@Injectable()
export class ProxyService {
  constructor(
    private readonly httpService: HttpService,
    private readonly apiKeysService: ApiKeysService,
  ) {}

  async forwardToCopilot(body: any, apiKey: string): Promise<any> {
    try {
      // Validate request body
      this.validateChatCompletionRequest(body);

      // TODO: Implement GitHub Copilot API forwarding
      // This is a placeholder implementation
      const response = {
        id: `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: body.model || 'gpt-3.5-turbo',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'This is a placeholder response from the proxy service.',
            },
            finish_reason: 'stop',
          },
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25,
        },
      };

      // Log the request for admin monitoring
      await this.logRequest(apiKey, body, response);

      return response;
    } catch (error) {
      throw new HttpException('Error forwarding to Copilot', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAvailableModels(): Promise<any> {
    // TODO: Implement model listing from GitHub Copilot
    return {
      object: 'list',
      data: [
        {
          id: 'gpt-3.5-turbo',
          object: 'model',
          created: 1677610602,
          owned_by: 'openai',
        },
        {
          id: 'gpt-4',
          object: 'model',
          created: 1687882411,
          owned_by: 'openai',
        },
      ],
    };
  }

  private validateChatCompletionRequest(body: any): void {
    if (!body || !body.messages || !Array.isArray(body.messages)) {
      throw new Error('Malformed request');
    }

    if (body.messages.length === 0) {
      throw new Error('Malformed request');
    }

    for (const message of body.messages) {
      if (!message.role || !message.content) {
        throw new Error('Malformed request');
      }
    }
  }

  private async logRequest(apiKey: string, request: any, response: any): Promise<void> {
    // TODO: Implement request logging for admin dashboard
    console.log(`Request logged for API key: ${apiKey.substring(0, 8)}...`);
  }
}
