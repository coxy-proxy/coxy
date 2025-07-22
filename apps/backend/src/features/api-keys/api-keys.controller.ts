import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../admin/guards/admin.guard';
import { ApiKeysService } from './api-keys.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';

@Controller('api-keys')
@UseGuards(AdminGuard)
export class ApiKeysController {
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

  @Post('github-auth/device-flow')
  async initiateGithubDeviceFlow() {
    return await this.apiKeysService.initiateGithubDeviceFlow();
  }

  @Post('github-auth/verify')
  async verifyGithubDeviceFlow(@Body() verifyDto: { device_code: string }) {
    return await this.apiKeysService.verifyGithubDeviceFlow(
      verifyDto.device_code,
    );
  }
}
