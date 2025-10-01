import { createHash } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from '_/shared/prisma/prisma.service';
import type { JwtFromRequestFunction } from 'passport-jwt';
import { ExtractJwt, Strategy } from 'passport-jwt';

export interface RefreshJwtPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const cookieRefreshTokenExtractor: JwtFromRequestFunction = (req: any) =>
  req?.cookies?.refresh_token || req?.cookies?.refreshToken || null;

const refreshExtractors: JwtFromRequestFunction[] = [cookieRefreshTokenExtractor];

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors(refreshExtractors),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.refreshSecret'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: RefreshJwtPayload) {
    const rawToken: string | null = req?.cookies?.refresh_token || req?.cookies?.refreshToken || null;
    if (!rawToken) throw new UnauthorizedException('No refresh token provided');

    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!stored || (stored.expiresAt && stored.expiresAt.getTime() < Date.now()) || stored.revokedAt) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) throw new UnauthorizedException('User not found');

    // Attach user; keep refreshToken if needed downstream
    return { id: user.id, email: user.email, name: user.name, role: user.role, refreshToken: rawToken };
  }
}
