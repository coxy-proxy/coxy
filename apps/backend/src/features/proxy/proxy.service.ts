import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { toHeaders } from '_/shared/utils';
import { Request, Response } from 'express';
import { lastValueFrom } from 'rxjs';
import { TokenResolverService } from './token-resolver.service';

interface ResponsesApiRequestBody {
  model: string;
  input: string | Array<{ role: string; content: string }>;
  stream?: boolean;
  instructions?: string;
  temperature?: number;
  max_output_tokens?: number;
  tools?: unknown[];
  tool_choice?: unknown;
}

interface ChatCompletionsRequestBody {
  model: string;
  messages: Array<{ role: string; content: string }>;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  tools?: unknown[];
  tool_choice?: unknown;
}

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);
  private readonly copilotApiUrl: string;
  private readonly globalPrefix: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly tokenResolver: TokenResolverService,
    private readonly configService: ConfigService,
  ) {
    this.copilotApiUrl = this.configService.get<string>('github.copilot.copilotApiUrl');
    this.globalPrefix = this.configService.get<string>('api.prefix');
  }

  async proxyRequest(req: Request, res: Response) {
    try {
      const body = req.method === 'GET' || req.method === 'HEAD' ? undefined : req.body;

      const headers = await this.getHeaders(req);

      const copilotResponse = await lastValueFrom(
        this.httpService.request({
          method: req.method,
          url: this.getTargetUrl(req).href,
          data: body,
          headers,
          responseType: 'stream',
        }),
      );

      res.setHeader('content-type', copilotResponse.headers['content-type']);
      copilotResponse.data.pipe(res);
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.message || 'Internal Server Error';
      this.logger.error(`Error proxying request to Copilot: ${error.message}`, message, error.stack);
      res.status(status).json({ message });
    }
  }

  async proxyResponsesRequest(req: Request, res: Response) {
    try {
      const originalBody = req.body as ResponsesApiRequestBody;
      const isStreaming = originalBody.stream === true;
      const translatedBody = this.translateResponsesRequestBody(originalBody);

      const { token } = await this.tokenResolver.resolveCopilotToken(req);
      const copilotHeaders = this.configService.get<Record<string, string>>('github.copilot.headers') ?? {};
      const contentLength = Buffer.byteLength(JSON.stringify(translatedBody), 'utf8');

      const headers: Record<string, string> = {
        ...toHeaders(req.headers),
        ...copilotHeaders,
        authorization: `Bearer ${token}`,
        'content-length': contentLength.toString(),
        'content-type': 'application/json',
      };

      const copilotResponse = await lastValueFrom(
        this.httpService.request({
          method: 'POST',
          url: `${this.copilotApiUrl}/chat/completions`,
          data: translatedBody,
          headers,
          responseType: 'stream',
        }),
      );

      const responseId = `resp_${Date.now()}`;
      const msgId = `msg_${Date.now()}`;

      if (isStreaming) {
        res.setHeader('content-type', 'text/event-stream');
        res.setHeader('cache-control', 'no-cache');
        res.setHeader('connection', 'keep-alive');
        this.pipeStreamingResponseAsResponsesFormat(copilotResponse.data, res, responseId, msgId, translatedBody.model);
      } else {
        const chunks: Buffer[] = [];
        copilotResponse.data.on('data', (chunk: Buffer) => chunks.push(chunk));
        copilotResponse.data.on('end', () => {
          try {
            const rawBody = Buffer.concat(chunks).toString('utf8');
            const chatResponse = JSON.parse(rawBody);
            res.setHeader('content-type', 'application/json');
            res.json(this.translateNonStreamingResponse(chatResponse, responseId, msgId));
          } catch (e) {
            this.logger.error(`Error parsing responses upstream response: ${(e as Error).message}`);
            res.status(500).json({ message: 'Error parsing upstream response' });
          }
        });
        copilotResponse.data.on('error', (err: Error) => {
          this.logger.error(`Responses data stream error: ${err.message}`);
          res.status(500).json({ message: 'Stream error' });
        });
      }
    } catch (error) {
      const status = error.response?.status || 500;
      const message = error.message || 'Internal Server Error';
      this.logger.error(`Error proxying responses request to Copilot: ${error.message}`, message, error.stack);
      res.status(status).json({ message });
    }
  }

  private getTargetUrl(req: Request): URL {
    const originalUrl = req.originalUrl.replace(this.globalPrefix, '').replace('//', '/');
    const targetUrl = new URL(originalUrl, this.copilotApiUrl);
    return targetUrl;
  }

  private async getHeaders(req: Request) {
    const headers = {
      ...toHeaders(req.headers),
      ...(this.configService.get<Record<string, string>>('github.copilot.headers') ?? {}),
    } as Record<string, string>;

    const isChatCompletions = this.getTargetUrl(req).pathname.startsWith('/chat/completions');
    if (isChatCompletions) {
      const { token } = await this.tokenResolver.resolveCopilotToken(req);
      headers.authorization = `Bearer ${token}`;

      const contentLength = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
      headers['content-length'] = contentLength.toString();
    }

    return headers;
  }

  private translateResponsesRequestBody(body: ResponsesApiRequestBody): ChatCompletionsRequestBody {
    const { input, max_output_tokens, instructions, stream, model, temperature, tools, tool_choice } = body;

    const messages: Array<{ role: string; content: string }> = [];

    if (instructions) {
      messages.push({ role: 'system', content: instructions });
    }

    if (typeof input === 'string') {
      messages.push({ role: 'user', content: input });
    } else if (Array.isArray(input)) {
      messages.push(...input);
    }

    const translated: ChatCompletionsRequestBody = { model, messages, stream };
    if (temperature !== undefined) translated.temperature = temperature;
    if (max_output_tokens !== undefined) translated.max_tokens = max_output_tokens;
    if (tools !== undefined) translated.tools = tools;
    if (tool_choice !== undefined) translated.tool_choice = tool_choice;

    return translated;
  }

  private translateNonStreamingResponse(chatResponse: Record<string, unknown>, responseId: string, msgId: string) {
    const choices = chatResponse.choices as Array<{ message?: { content?: string } }>;
    const choice = choices?.[0];
    const usage = chatResponse.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };

    return {
      id: responseId,
      object: 'response',
      created_at: chatResponse.created ?? Math.floor(Date.now() / 1000),
      model: chatResponse.model,
      status: 'completed',
      output: [
        {
          id: msgId,
          type: 'message',
          role: 'assistant',
          status: 'completed',
          content: [{ type: 'output_text', text: choice?.message?.content ?? '' }],
        },
      ],
      usage: {
        input_tokens: usage?.prompt_tokens ?? 0,
        output_tokens: usage?.completion_tokens ?? 0,
        total_tokens: usage?.total_tokens ?? 0,
      },
    };
  }

  private pipeStreamingResponseAsResponsesFormat(
    stream: NodeJS.ReadableStream,
    res: Response,
    responseId: string,
    msgId: string,
    model: string,
  ) {
    let fullText = '';
    let buffer = '';
    let headersSent = false;

    const sendEvent = (data: unknown) => {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    stream.on('data', (chunk: Buffer) => {
      buffer += chunk.toString('utf8');
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const rawData = line.slice(6).trim();
        if (rawData === '[DONE]') continue;

        let parsed: { choices?: Array<{ delta?: { content?: string } }> };
        try {
          parsed = JSON.parse(rawData);
        } catch {
          continue;
        }

        if (!headersSent) {
          headersSent = true;
          sendEvent({ type: 'response.created', response: { id: responseId, object: 'response', created_at: Math.floor(Date.now() / 1000), model, status: 'in_progress', output: [] } });
          sendEvent({ type: 'response.output_item.added', output_index: 0, item: { id: msgId, type: 'message', status: 'in_progress', role: 'assistant', content: [] } });
          sendEvent({ type: 'response.content_part.added', output_index: 0, content_index: 0, part: { type: 'output_text', text: '' } });
        }

        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          fullText += delta;
          sendEvent({ type: 'response.output_text.delta', output_index: 0, content_index: 0, delta });
        }
      }
    });

    stream.on('end', () => {
      if (!headersSent) {
        sendEvent({ type: 'response.created', response: { id: responseId, object: 'response', created_at: Math.floor(Date.now() / 1000), model, status: 'in_progress', output: [] } });
        sendEvent({ type: 'response.output_item.added', output_index: 0, item: { id: msgId, type: 'message', status: 'in_progress', role: 'assistant', content: [] } });
        sendEvent({ type: 'response.content_part.added', output_index: 0, content_index: 0, part: { type: 'output_text', text: '' } });
      }

      sendEvent({ type: 'response.output_text.done', output_index: 0, content_index: 0, text: fullText });
      sendEvent({ type: 'response.output_item.done', output_index: 0, item: { id: msgId, type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: fullText }] } });
      sendEvent({ type: 'response.completed', response: { id: responseId, object: 'response', status: 'completed', model, output: [{ id: msgId, type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text: fullText }] }] } });
      res.write('data: [DONE]\n\n');
      res.end();
    });

    stream.on('error', (err: Error) => {
      this.logger.error(`Responses stream error: ${err.message}`, err.stack);
      res.end();
    });
  }
}
