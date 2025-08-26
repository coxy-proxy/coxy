import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ApiKeysSharedModule } from '_/shared/api-keys';
import { GithubOauthService } from '../api-keys/github-oauth.service';
import { ProxyController } from './proxy.controller';
import { ProxyService } from './proxy.service';
import { TokenResolverService } from './token-resolver.service';

@Module({
  imports: [HttpModule, ApiKeysSharedModule],
  controllers: [ProxyController],
  // TODO: move GithubOauthService to a separate module
  providers: [ProxyService, GithubOauthService, TokenResolverService],
  exports: [ProxyService],
})
export class ProxyModule {}
