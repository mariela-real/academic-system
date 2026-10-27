import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthenticatedUser } from '../../domain/entity/authenticated-user.js';
import { UserRole } from '../../domain/entity/user-role.js';

type AuthenticatedRequest = Request & {
  cookies?: Record<string, string>;
  user?: AuthenticatedUser;
};

type JwtPayload = {
  sub: string;
  email: string;
  fullName: string;
  role: UserRole;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies?.academic_session ?? this.getBearerToken(request);

    if (!token) {
      throw new UnauthorizedException('Se requiere iniciar sesión.');
    }

    const payload = await this.verifyToken(token);
    request.user = {
      id: payload.sub,
      email: payload.email,
      fullName: payload.fullName,
      role: payload.role,
    };

    return true;
  }

  private getBearerToken(request: Request): string | undefined {
    const authorization = request.headers.authorization;

    if (
      typeof authorization !== 'string' ||
      authorization.startsWith('Bearer ') === false
    ) {
      return undefined;
    }

    return authorization.slice('Bearer '.length);
  }

  private async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

      if (this.isValidPayload(payload) === false) {
        throw new UnauthorizedException('La sesión no es válida.');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('La sesión no es válida o expiró.', {
        cause: error,
      });
    }
  }

  private isValidPayload(payload: JwtPayload): boolean {
    return (
      typeof payload.sub === 'string' &&
      typeof payload.email === 'string' &&
      typeof payload.fullName === 'string' &&
      this.isValidRole(payload.role)
    );
  }

  private isValidRole(value: unknown): value is UserRole {
    return (
      value === UserRole.ADMIN ||
      value === UserRole.TEACHER ||
      value === UserRole.STUDENT
    );
  }
}
