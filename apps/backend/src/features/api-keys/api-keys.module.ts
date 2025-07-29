import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiKeysSharedModule } from '_/shared/api-keys';
import { ApiKeysController } from './api-keys.controller';
import { ApiKeysService } from './api-keys.service';
import { GithubOauthService } from './github-oauth.service';

@Module({
  imports: [HttpModule, ApiKeysSharedModule],
  controllers: [ApiKeysController],
  providers: [ApiKeysService, GithubOauthService],
  exports: [ApiKeysService],
})
export class ApiKeysModule {}
