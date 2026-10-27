import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { UsersRepository } from '../../data/repository/users.repository.js';
import { UserBuilder } from '../../../../../test/builders/user.builder.js';
import { UserRole } from '../entity/user-role.js';
import { AuthService } from './auth.service.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Account access', () => {
  it('rejects unknown email and password combinations uniformly', async () => {
    // arrange
    const usersRepository: Pick<
      UsersRepository,
      'findByEmail' | 'findAll' | 'create'
    > = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      create: vi.fn(),
    };
    const jwtService: Pick<JwtService, 'signAsync'> = {
      signAsync: vi.fn(),
    };
    const authService = new AuthService(usersRepository, jwtService);

    // act
    const response = authService.login({
      email: 'missing@example.test',
      password: 'invalid-password',
    });

    // assert
    await expect(response).rejects.toThrow('Credenciales no válidas.');
    expect(jwtService.signAsync).not.toHaveBeenCalled();
  });

  it('stores a password hash and returns no credential data', async () => {
    // arrange
    const persistedUser = new UserBuilder()
      .withEmail('admin@example.test')
      .withRole(UserRole.ADMIN)
      .build();
    const usersRepository: Pick<
      UsersRepository,
      'findByEmail' | 'findAll' | 'create'
    > = {
      findByEmail: vi.fn().mockResolvedValue(null),
      findAll: vi.fn(),
      create: vi.fn().mockResolvedValue(persistedUser),
    };
    const jwtService: Pick<JwtService, 'signAsync'> = {
      signAsync: vi.fn(),
    };
    const authService = new AuthService(usersRepository, jwtService);
    const password = 'development-password-123';

    // act
    const response = await authService.createUser({
      email: persistedUser.email,
      fullName: persistedUser.fullName,
      password,
      role: UserRole.ADMIN,
    });

    // assert
    const createUser = vi.mocked(usersRepository.create).mock.calls[0][0];
    expect(createUser.passwordHash).not.toBe(password);
    await expect(
      compare(password, createUser.passwordHash!),
    ).resolves.toBe(true);
    expect(response).not.toHaveProperty('passwordHash');
    expect(response.role).toBe(UserRole.ADMIN);
  });

  it('rejects duplicate email accounts', async () => {
    // arrange
    const existingUser = new UserBuilder().build();
    const usersRepository: Pick<
      UsersRepository,
      'findByEmail' | 'findAll' | 'create'
    > = {
      findByEmail: vi.fn().mockResolvedValue(existingUser),
      findAll: vi.fn(),
      create: vi.fn(),
    };
    const jwtService: Pick<JwtService, 'signAsync'> = {
      signAsync: vi.fn(),
    };
    const authService = new AuthService(usersRepository, jwtService);

    // act
    const response = authService.createUser({
      email: existingUser.email,
      fullName: existingUser.fullName,
      password: 'development-password-123',
      role: UserRole.STUDENT,
    });

    // assert
    await expect(response).rejects.toThrow(
      'Ya existe una cuenta con ese correo.',
    );
  });

  it('lists accounts without exposing stored password hashes', async () => {
    // arrange
    const teacher = new UserBuilder()
      .withRole(UserRole.TEACHER)
      .build();
    const usersRepository: Pick<
      UsersRepository,
      'findByEmail' | 'findAll' | 'create'
    > = {
      findByEmail: vi.fn(),
      findAll: vi.fn().mockResolvedValue([teacher]),
      create: vi.fn(),
    };
    const jwtService: Pick<JwtService, 'signAsync'> = {
      signAsync: vi.fn(),
    };
    const authService = new AuthService(usersRepository, jwtService);

    // act
    const users = await authService.getUsers();

    // assert
    expect(users).toEqual([
      {
        id: teacher.id,
        email: teacher.email,
        fullName: teacher.fullName,
        role: UserRole.TEACHER,
      },
    ]);
  });
});
