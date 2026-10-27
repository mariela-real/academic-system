import { User } from '../../src/modules/auth/domain/entity/user.entity.js';
import { UserRole } from '../../src/modules/auth/domain/entity/user-role.js';

export class UserBuilder {
  private readonly user = Object.assign(new User(), {
    id: '258a3bcf-796f-4472-a379-fab66fb47b06',
    email: 'student@example.test',
    fullName: 'Test Student',
    passwordHash: 'stored-hash',
    role: UserRole.STUDENT,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  });

  withEmail(email: string): this {
    this.user.email = email;
    return this;
  }

  withPasswordHash(passwordHash: string): this {
    this.user.passwordHash = passwordHash;
    return this;
  }

  withRole(role: UserRole): this {
    this.user.role = role;
    return this;
  }

  build(): User {
    return Object.assign(new User(), this.user);
  }
}
