import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    private readonly rolesGuard: RolesGuard,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First validate JWT and attach req.user
    const jwtOk = await Promise.resolve(this.jwtAuthGuard.canActivate(context));
    if (!jwtOk) return false;

    // Ensure 'admin' role is required for this route
    const handler = context.getHandler();
    const cls = context.getClass();
    const existing = this.reflector.getAllAndOverride<string[]>('roles', [handler, cls]);
    if (!existing || existing.length === 0) {
      Reflect.defineMetadata('roles', ['admin'], handler);
    }

    // Enforce role via RolesGuard
    return Promise.resolve(this.rolesGuard.canActivate(context));
  }
}
