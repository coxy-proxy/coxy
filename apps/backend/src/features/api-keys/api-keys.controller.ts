import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { CreateApiKeyDto, DeviceFlowSSEEvent, SetDefaultApiKeyDto, UpdateApiKeyDto } from '@/shared/types/api-key';
import { User as UserDecorator } from '../auth/decorators/user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
@UseGuards(JwtAuthGuard)
export class ApiKeysController {
  private logger = new Logger(ApiKeysController.name);

  private deviceFlowMap = new Map<string, Observable<MessageEvent<DeviceFlowSSEEvent>>>();

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(@UserDecorator('id') userId: string, @Body() createApiKeyDto: CreateApiKeyDto) {
    return await this.apiKeysService.createApiKey(userId, createApiKeyDto);
  }

  @Get()
  async listApiKeys(@UserDecorator('id') userId: string) {
    return await this.apiKeysService.listApiKeys(userId);
  }

  @Patch(':id')
  async updateApiKey(
    @UserDecorator('id') userId: string,
    @Param('id') id: string,
    @Body() updateApiKeyDto: UpdateApiKeyDto,
  ) {
    return await this.apiKeysService.updateApiKey(userId, id, updateApiKeyDto);
  }

  @Delete(':id')
  async deleteApiKey(@UserDecorator('id') userId: string, @Param('id') id: string) {
    return await this.apiKeysService.deleteApiKey(userId, id);
  }

  @Post(':id/refresh-meta')
  async refreshMeta(@UserDecorator('id') userId: string, @Param('id') id: string) {
    return await this.apiKeysService.refreshApiKeyMeta(userId, id);
  }

  @Sse('device-flow')
  deviceFlowSSE(@UserDecorator('id') userId: string): Observable<MessageEvent<DeviceFlowSSEEvent>> {
    if (this.deviceFlowMap.has(userId)) {
      return this.deviceFlowMap.get(userId);
    }

    const deviceFlow$ = this.apiKeysService.executeDeviceFlowWithSSE(userId).pipe(
      tap((event) => {
        this.logger.log('SSE event:', event);
        event.type === 'success' && this.deviceFlowMap.delete(userId);
      }),
      map(
        (event: DeviceFlowSSEEvent) =>
          ({
            type: event.type,
            data: event,
          }) as MessageEvent<DeviceFlowSSEEvent>,
      ),
      shareReplay(1),
    );
    this.deviceFlowMap.set(userId, deviceFlow$);

    return deviceFlow$;
  }

  @Post('default')
  async setDefaultApiKey(@UserDecorator('id') userId: string, @Body() setDefaultApiKeyDto: SetDefaultApiKeyDto) {
    return await this.apiKeysService.setDefaultApiKey(userId, setDefaultApiKeyDto);
  }
}
