import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcryptjs';
import { UsersRepository } from '../../data/repository/users.repository.js';
import { User } from '../entity/user.entity.js';
import { AuthenticatedUser } from '../entity/authenticated-user.js';
import { CreateUserRequest } from '../../presentation/request/create-user.request.js';
import { LoginRequest } from '../../presentation/request/login.request.js';

type LoginResult = {
  accessToken: string;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(UsersRepository)
    private readonly usersRepository: Pick<
      UsersRepository,
      'findByEmail' | 'findAll' | 'create'
    >,
    @Inject(JwtService)
    private readonly jwtService: Pick<JwtService, 'signAsync'>,
  ) {}

  async login(request: LoginRequest): Promise<LoginResult> {
    const user = await this.usersRepository.findByEmail(request.email);
    const passwordMatches =
      user !== null && (await compare(request.password, user.passwordHash));

    if (passwordMatches === false || user === null) {
      throw new UnauthorizedException('Credenciales no válidas.');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    return {
      accessToken,
      user: this.toAuthenticatedUser(user),
    };
  }

  async createUser(request: CreateUserRequest): Promise<AuthenticatedUser> {
    const email = request.email.toLowerCase();
    const existingUser = await this.usersRepository.findByEmail(email);

    if (existingUser !== null) {
      throw new ConflictException('Ya existe una cuenta con ese correo.');
    }

    const passwordHash = await hash(request.password, 12);
    const user = await this.usersRepository.create({
      email,
      fullName: request.fullName,
      passwordHash,
      role: request.role,
    });

    return this.toAuthenticatedUser(user);
  }

  async getUsers(): Promise<AuthenticatedUser[]> {
    const users = await this.usersRepository.findAll();

    return users.map((user) => this.toAuthenticatedUser(user));
  }

  toAuthenticatedUser(user: User): AuthenticatedUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    };
  }
}
