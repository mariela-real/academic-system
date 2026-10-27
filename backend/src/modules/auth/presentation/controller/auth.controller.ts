import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import type { AuthenticatedUser } from '../../domain/entity/authenticated-user.js';
import { UserRole } from '../../domain/entity/user-role.js';
import { AuthService } from '../../domain/service/auth.service.js';
import { CreateUserRequest } from '../request/create-user.request.js';
import { LoginRequest } from '../request/login.request.js';
import { CurrentUser } from '../decorator/current-user.decorator.js';
import { Roles } from '../decorator/roles.decorator.js';
import { JwtAuthGuard } from '../guard/jwt-auth.guard.js';
import { RolesGuard } from '../guard/roles.guard.js';

const SESSION_COOKIE = 'academic_session';
const SESSION_DURATION_MS = 60 * 60 * 1000;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(
    @Body() request: LoginRequest,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthenticatedUser> {
    const result = await this.authService.login(request);

    response.cookie(SESSION_COOKIE, result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_DURATION_MS,
      path: '/',
    });

    return result.user;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response): { status: 'ok' } {
    response.clearCookie(SESSION_COOKIE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { status: 'ok' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: AuthenticatedUser): AuthenticatedUser {
    return user;
  }

  @Post('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  createUser(@Body() request: CreateUserRequest): Promise<AuthenticatedUser> {
    return this.authService.createUser(request);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  getUsers(): Promise<AuthenticatedUser[]> {
    return this.authService.getUsers();
  }
}
