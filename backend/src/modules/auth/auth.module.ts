import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersRepository } from './data/repository/users.repository.js';
import { User } from './domain/entity/user.entity.js';
import { AuthService } from './domain/service/auth.service.js';
import { DevelopmentAdminSeedService } from './domain/service/development-admin-seed.service.js';
import { AuthController } from './presentation/controller/auth.controller.js';
import { JwtAuthGuard } from './presentation/guard/jwt-auth.guard.js';
import { RolesGuard } from './presentation/guard/roles.guard.js';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.getOrThrow<string>('JWT_SECRET');

        if (secret.length < 32) {
          throw new Error('JWT_SECRET debe tener al menos 32 caracteres.');
        }

        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DevelopmentAdminSeedService,
    JwtAuthGuard,
    RolesGuard,
    UsersRepository,
  ],
  exports: [JwtModule, JwtAuthGuard, RolesGuard, UsersRepository],
  
})
export class AuthModule {}
