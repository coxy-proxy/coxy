import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '_/shared/prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly accessSecret: string;

  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    this.accessSecret = this.config.get<string>('JWT_ACCESS_SECRET') || this.config.get<string>('JWT_SECRET');
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const token = this.extractToken(req.headers.authorization);
    if (!token) throw new UnauthorizedException('No token provided');

    try {
      const payload = await this.jwt.verifyAsync<{ sub: string }>(token, { secret: this.accessSecret });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Invalid token');
      req.user = { id: user.id, email: user.email, name: user.name, role: user.role };
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractToken(authorization?: string): string | undefined {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
