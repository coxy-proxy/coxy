import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import * as config from 'config';
import { AdminModule } from '../features/admin/admin.module';
import { ApiKeysModule } from '../features/api-keys/api-keys.module';
import { ProxyModule } from '../features/proxy/proxy.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: config.get<string>('jwt.secret') || 'your-secret-key',
      signOptions: { expiresIn: '24h' },
    }),
    HttpModule.register({
      timeout: 30000,
      maxRedirects: 5,
    }),
    ProxyModule,
    AdminModule,
    ApiKeysModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
