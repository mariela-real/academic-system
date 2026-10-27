import type { Response } from 'express';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../domain/service/auth.service.js';
import { AuthController } from './auth.controller.js';

describe('Academic session', () => {
  it('clears the session cookie when signing out', () => {
    // arrange
    const clearCookie = vi.fn();
    const response = {
      clearCookie,
    } as unknown as Response;
    const authController = new AuthController({} as AuthService);

    // act
    const result = authController.logout(response);

    // assert
    expect(result).toEqual({ status: 'ok' });
    expect(clearCookie).toHaveBeenCalledWith(
      'academic_session',
      expect.objectContaining({
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
      }),
    );
  });
});
