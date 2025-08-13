import { Body, Controller, Delete, Get, Logger, Param, Patch, Post, Sse, UseGuards } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { CreateApiKeyDto, DeviceFlowSSEEvent, SetDefaultApiKeyDto, UpdateApiKeyDto } from '@/shared/types/api-key';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ApiKeysService } from './api-keys.service';

@Controller('api-keys')
// TODO: Uncomment this line to enable admin access
// @UseGuards(AdminGuard)
export class ApiKeysController {
  private logger = new Logger(ApiKeysController.name);

  // TODO: Implement user management
  private currentUserId = 'abc';
  private deviceFlowMap = new Map<string, Observable<MessageEvent<DeviceFlowSSEEvent>>>();

  constructor(private readonly apiKeysService: ApiKeysService) {}

  @Post()
  async createApiKey(@Body() createApiKeyDto: CreateApiKeyDto) {
    return await this.apiKeysService.createApiKey(createApiKeyDto);
  }

  @Get()
  async listApiKeys() {
    return await this.apiKeysService.listApiKeys();
  }

  @Patch(':id')
  async updateApiKey(@Param('id') id: string, @Body() updateApiKeyDto: UpdateApiKeyDto) {
    return await this.apiKeysService.updateApiKey(id, updateApiKeyDto);
  }

  @Delete(':id')
  async deleteApiKey(@Param('id') id: string) {
    return await this.apiKeysService.deleteApiKey(id);
  }

  @Post(':id/refresh-meta')
  async refreshMeta(@Param('id') id: string) {
    return await this.apiKeysService.refreshApiKeyMeta(id);
  }

  @Sse('device-flow')
  deviceFlowSSE(): Observable<MessageEvent<DeviceFlowSSEEvent>> {
    if (this.deviceFlowMap.has(this.currentUserId)) {
      return this.deviceFlowMap.get(this.currentUserId);
    }

    const deviceFlow$ = this.apiKeysService.executeDeviceFlowWithSSE().pipe(
      tap((event) => {
        this.logger.log('SSE event:', event);
        event.type === 'success' && this.deviceFlowMap.delete(this.currentUserId);
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
    this.deviceFlowMap.set(this.currentUserId, deviceFlow$);

    return deviceFlow$;
  }

  @Post('default')
  async setDefaultApiKey(@Body() setDefaultApiKeyDto: SetDefaultApiKeyDto) {
    return await this.apiKeysService.setDefaultApiKey(setDefaultApiKeyDto);
  }
}
