import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User as UserDecorator } from './decorators/user.decorator';
import type { GoogleProfileDto } from './dto/google-profile.dto';
import { LoginDto } from './dto/login.dto';
import type { LoginResponseDto } from './dto/login-response.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RegisterDto } from './dto/register.dto';

import { UpdateProfileDto } from './dto/update-profile.dto';
import { GoogleOauthGuard } from './guards/google.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('register')
  @UseGuards(ThrottlerGuard)
  async register(@Body() dto: RegisterDto): Promise<LoginResponseDto> {
    return this.auth.register(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    return this.auth.login(dto.email, dto.password);
  }

  @Post('refresh')
  @UseGuards(ThrottlerGuard, RefreshJwtAuthGuard)
  async refresh(@UserDecorator('id') userId: string, @Body() dto: RefreshDto) {
    // Guard verifies token signature and revocation; service performs rotation and issuing
    return this.auth.refresh(userId, dto.refreshToken);
  }

  @Post('logout')
  async logout(@Body() dto: RefreshDto) {
    await this.auth.logout(dto.refreshToken);
    return { success: true };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  async profile(@UserDecorator() user: any) {
    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar ?? null,
        authProvider: user.authProvider ?? undefined,
      },
    };
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@UserDecorator('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.auth.updateProfile(userId, dto);
  }

  // Phase C: Google OAuth endpoints
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleAuth() {
    // Passport handles the redirect
    return;
  }

  @Get('google/callback')
  @UseGuards(ThrottlerGuard, GoogleOauthGuard)
  async googleAuthCallback(@Req() req: Request, @Res() res: Response) {
    try {
      const profile = req.user as GoogleProfileDto; // { googleId, email, name, avatar }
      const user = await this.auth.validateGoogleUser(profile);
      const { accessToken, refreshToken } = await this.auth.generateTokensForUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const base = this.config.get<string>('frontend.url')!;
      const successPath = this.config.get<string>('frontend.oauthSuccessPath') || '/auth/oauth-success';

      const secure = process.env.NODE_ENV === 'production';
      const sameSite: 'lax' | 'strict' | 'none' = 'lax';
      const accessMaxAgeMs = this.auth.getAccessTtlMs();
      const refreshMaxAgeMs = this.auth.getRefreshTtlMs();
      res.cookie('access_token', accessToken, { httpOnly: true, secure, sameSite, maxAge: accessMaxAgeMs, path: '/' });
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure,
        sameSite,
        maxAge: refreshMaxAgeMs,
        path: '/',
      });

      const url = new URL(successPath, base);
      return res.redirect(url.toString());
    } catch (err: any) {
      const base = this.config.get<string>('frontend.url')!;
      const errorPath = this.config.get<string>('frontend.oauthErrorPath') || '/auth/oauth-error';
      const url = new URL(errorPath, base);
      return res.redirect(url.toString());
    }
  }
}
