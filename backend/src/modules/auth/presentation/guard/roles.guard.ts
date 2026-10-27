import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedUser } from '../../domain/entity/authenticated-user.js';
import { UserRole } from '../../domain/entity/user-role.js';
import { ROLES_KEY } from '../decorator/roles.decorator.js';

type AuthenticatedRequest = {
  user?: AuthenticatedUser;
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!allowedRoles) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedRequest>();

    return (
      request.user !== undefined && allowedRoles.includes(request.user.role)
    );
  }
}
