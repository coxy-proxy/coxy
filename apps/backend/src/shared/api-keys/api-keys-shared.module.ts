import { Module } from '@nestjs/common';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';
import { ApiKeyGuard } from './guards/api-key.guard';

@Module({
  providers: [ApiKeysFileStorageService, ApiKeyGuard],
  exports: [ApiKeysFileStorageService],
})
export class ApiKeysSharedModule {}
