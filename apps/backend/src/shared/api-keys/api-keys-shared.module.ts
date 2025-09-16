import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ApiKeysDatabaseService } from './api-keys-database.service';
import { API_KEYS_STORAGE } from './tokens';

@Module({
  imports: [PrismaModule],
  providers: [ApiKeysDatabaseService, { provide: API_KEYS_STORAGE, useExisting: ApiKeysDatabaseService }],
  exports: [API_KEYS_STORAGE],
})
export class ApiKeysSharedModule {}
