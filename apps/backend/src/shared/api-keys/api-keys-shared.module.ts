import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeysDatabaseService } from './api-keys-database.service';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';
import { API_KEYS_STORAGE } from './tokens';

@Module({
  imports: [ConfigModule, PrismaModule],
  providers: [
    ApiKeysFileStorageService,
    ApiKeysDatabaseService,
    {
      provide: API_KEYS_STORAGE,
      inject: [ConfigService, ApiKeysFileStorageService, ApiKeysDatabaseService],
      useFactory: (config: ConfigService, fileSvc: ApiKeysFileStorageService, dbSvc: ApiKeysDatabaseService) => {
        const storage = config.get<string>('apiKeys.storage') ?? 'file';
        return storage === 'database' ? dbSvc : fileSvc;
      },
    },
  ],
  exports: [API_KEYS_STORAGE],
})
export class ApiKeysSharedModule {}
