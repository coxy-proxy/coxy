import { Body, Controller, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ThrottlerGuard } from '@nestjs/throttler';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User as UserDecorator } from './decorators/user.decorator';
import { LoginDto } from './dto/login.dto';
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
  async register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  @UseGuards(ThrottlerGuard)
  async login(@Body() dto: LoginDto) {
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
    return { user: { id: user.id, email: user.email, name: user.name, role: user.role } };
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
      const profile = req.user as any; // { googleId, email, name, avatar }
      const user = await this.auth.validateGoogleUser(profile);
      const { accessToken, refreshToken } = await this.auth.generateTokensForUser({
        id: user.id,
        email: user.email,
        role: user.role,
      });

      const base = this.config.get<string>('frontend.url')!;
      const successPath = this.config.get<string>('frontend.oauthSuccessPath') || '/auth/oauth-success';
      const url = new URL(successPath, base);
      url.searchParams.set('access_token', accessToken);
      url.searchParams.set('refresh_token', refreshToken);
      return res.redirect(url.toString());
    } catch (err: any) {
      const base = this.config.get<string>('frontend.url')!;
      const errorPath = this.config.get<string>('frontend.oauthErrorPath') || '/auth/oauth-error';
      const url = new URL(errorPath, base);
      url.searchParams.set('error', err?.message || 'OAuthError');
      return res.redirect(url.toString());
    }
  }
}
