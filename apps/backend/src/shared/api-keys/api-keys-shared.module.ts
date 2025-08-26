import { Module } from '@nestjs/common';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';

@Module({
  providers: [ApiKeysFileStorageService],
  exports: [ApiKeysFileStorageService],
})
export class ApiKeysSharedModule {}
