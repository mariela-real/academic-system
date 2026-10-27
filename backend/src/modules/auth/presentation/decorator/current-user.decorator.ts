import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import { AuthenticatedUser } from '../../domain/entity/authenticated-user.js';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser | undefined =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().user,
);
