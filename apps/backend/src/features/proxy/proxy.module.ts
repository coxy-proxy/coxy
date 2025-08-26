import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiKeysSharedModule } from '_/shared/api-keys';
import { ApiKeyGuard } from '../api-keys/guards/api-key.guard';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';

@Module({
  imports: [HttpModule, ApiKeysSharedModule],
  controllers: [ProxyController],
  providers: [ProxyService],
  exports: [ProxyService],
})
export class ProxyModule {}
