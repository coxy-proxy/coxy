import { createHash } from 'node:crypto';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '_/shared/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import type { UpdateProfileDto } from './dto/update-profile.dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  private readonly accessSecret: string;
  private readonly refreshSecret: string;
  private readonly accessTtl: string;
  private readonly refreshTtl: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.accessSecret = this.config.get<string>('jwt.accessSecret')!;
    this.refreshSecret = this.config.get<string>('jwt.refreshSecret')!;
    this.accessTtl = this.config.get<string>('jwt.accessTtl')!;
    this.refreshTtl = this.config.get<string>('jwt.refreshTtl')!;
  }

  // Password hashing using bcrypt
  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    return bcrypt.compare(password, stored);
  }

  private async issueTokens(user: { id: string; email: string; role: string }) {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role === 'ADMIN' ? 'admin' : 'user' };
    const accessToken = await this.jwt.signAsync(payload, { secret: this.accessSecret, expiresIn: this.accessTtl });
    const refreshToken = await this.jwt.signAsync(payload, { secret: this.refreshSecret, expiresIn: this.refreshTtl });

    // Store hashed refresh token
    const tokenHash = this.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + this.parseTtlMs(this.refreshTtl));
    await this.prisma.refreshToken.create({ data: { tokenHash, userId: user.id, expiresAt } });

    return { accessToken, refreshToken };
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseTtlMs(ttl: string): number {
    // very small parser for number+unit, supports m,h,d
    const m = ttl.match(/^(\d+)([smhd])$/);
    if (!m) return 0;
    const n = Number(m[1]);
    const unit = m[2];
    switch (unit) {
      case 's':
        return n * 1000;
      case 'm':
        return n * 60 * 1000;
      case 'h':
        return n * 60 * 60 * 1000;
      case 'd':
        return n * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }

  async register(dto: { email: string; password: string; name?: string }) {
    // validate uniqueness
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new BadRequestException('Email already registered');
    }

    const passwordHash = await this.hashPassword(dto.password);
    const user = await this.prisma.user.create({ data: { email: dto.email, name: dto.name ?? null, passwordHash } });

    const tokens = await this.issueTokens({ id: user.id, email: user.email, role: 'USER' });
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await this.verifyPassword(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens({ id: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async refresh(userId: string, refreshToken: string) {
    // Guard already verified signature and revocation; proceed to rotate
    const tokenHash = this.hashToken(refreshToken);

    // Best-effort delete existing refresh token (rotation)
    await this.prisma.refreshToken.delete({ where: { tokenHash } }).catch(() => void 0);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const tokens = await this.issueTokens({ id: user.id, email: user.email, role: user.role });
    return { user: { id: user.id, email: user.email, name: user.name }, ...tokens };
  }

  async logout(refreshToken: string) {
    const tokenHash = this.hashToken(refreshToken);
    // best-effort revoke
    await this.prisma.refreshToken
      .update({ where: { tokenHash }, data: { revokedAt: new Date() } })
      .catch(() => void 0);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({ where: { id: userId }, data: { name: dto.name ?? undefined } });
    return { user: { id: user.id, email: user.email, name: user.name } };
  }
}
