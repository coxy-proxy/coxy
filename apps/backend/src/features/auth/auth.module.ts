import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '_/shared/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { RolesGuard } from './guards/roles.guard';

@Module({
  imports: [ConfigModule, JwtModule.register({}), PrismaModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthGuard, RolesGuard, RateLimitGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard, RateLimitGuard],
})
export class AuthModule {}
