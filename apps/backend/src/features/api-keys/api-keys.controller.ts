import { Body, Controller, Delete, Get, Logger, Param, Post, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, share, tap } from 'rxjs/operators';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { DeviceFlowSSEEvent } from './dto/device-flow-sse-event.dto';

@Controller('api-keys')
@UseGuards(AdminGuard)
export class ApiKeysController {
  private logger = new Logger(ApiKeysController.name);

  // TODO: Implement user management
  private currentUserId = 'abc';
  private deviceFlowMap = new Map<string, Observable<MessageEvent<DeviceFlowSSEEvent>>>();

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return await this.apiKeysService.createApiKey(createApiKeyDto.name);
  }

  @Get()
  async listApiKeys() {
    return await this.apiKeysService.listApiKeys();
  }

  @Delete(':id')
  async deleteApiKey(@Param('id') id: string) {
    return await this.apiKeysService.deleteApiKey(id);
  }

  @Sse('device-flow')
  deviceFlowSSE(): Observable<MessageEvent<DeviceFlowSSEEvent>> {
    if (this.deviceFlowMap.has(this.currentUserId)) {
      return this.deviceFlowMap.get(this.currentUserId);
    }

    const deviceFlow$ = this.apiKeysService.executeDeviceFlowWithSSE().pipe(
      tap((event) => {
        this.logger.log('SSE event:', event);
        event.type === 'success' && this.onDeviceFlowSuccess(event, this.currentUserId);
      }),
      map(
        (event: DeviceFlowSSEEvent) =>
          ({
            type: event.type,
            data: event,
          }) as MessageEvent<DeviceFlowSSEEvent>,
      ),
      share(),
    );
    this.deviceFlowMap.set(this.currentUserId, deviceFlow$);

    return deviceFlow$;
  }

  private onDeviceFlowSuccess = (event: DeviceFlowSSEEvent, userId: string) => {
    this.apiKeysService.createApiKey({ name: `Key:${Date.now()}`, key: event.accessToken });
    this.deviceFlowMap.delete(userId);
    this.logger.log('Stored API key by device flow');
  };
}
