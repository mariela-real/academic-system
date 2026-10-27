import {
  Injectable,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service.js';
import { UsersRepository } from '../../data/repository/users.repository.js';
import { UserRole } from '../entity/user-role.js';

@Injectable()
export class DevelopmentAdminSeedService implements OnApplicationBootstrap {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
    private readonly usersRepository: UsersRepository,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if (this.config.get('NODE_ENV') === 'production') {
      return;
    }

    const seed = this.readSeedConfiguration();

    if (seed === null) {
      return;
    }

    const existingUser = await this.usersRepository.findByEmail(seed.email);

    if (existingUser !== null) {
      return;
    }

    await this.authService.createUser({
      ...seed,
      role: UserRole.ADMIN,
    });
  }

  private readSeedConfiguration(): {
    email: string;
    fullName: string;
    password: string;
  } | null {
    const email = this.config.get<string>('DEV_ADMIN_EMAIL');
    const fullName = this.config.get<string>('DEV_ADMIN_NAME');
    const password = this.config.get<string>('DEV_ADMIN_PASSWORD');
    const configuredValues = [email, fullName, password].filter(
      (value) => value !== undefined,
    );

    if (configuredValues.length === 0) {
      return null;
    }

    if (!email || !fullName || !password || password.length < 12) {
      throw new Error(
        'Configura DEV_ADMIN_EMAIL, DEV_ADMIN_NAME y una contraseña de desarrollo de al menos 12 caracteres.',
      );
    }

    return { email, fullName, password };
  }
}
