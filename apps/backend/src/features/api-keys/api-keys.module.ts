import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysFileStorageService } from './api-keys-file-storage.service';
import { GithubOauthService } from './github-oauth.service';

@Module({
  imports: [HttpModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, GithubOauthService, ApiKeysFileStorageService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
