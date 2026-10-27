
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicPeriodsAndAudit1793130100000 } from './data/migrations/AcademicPeriodsAndAudit1793130100000.js';
import { InitialAcademicSchema1793130000000 } from './data/migrations/InitialAcademicSchema.js';
import { AcademicPeriodsModule } from './modules/academic-periods/academic-periods.module.js';
import { AcademicHistoryModule } from './modules/academic-history/academic-history.module.js';
import { AuditModule } from './modules/audit/audit.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { CoursesModule } from './modules/courses/courses.module.js';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module.js';
import { GradesModule } from './modules/grades/grades.module.js';
import { StudentsModule } from './modules/students/students.module.js';
import { SubjectsModule } from './modules/subjects/subjects.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.getOrThrow<string>('DB_HOST'),
        port: Number(config.getOrThrow<string>('DB_PORT')),
        username: config.getOrThrow<string>('DB_USERNAME'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: false,
        migrations: [
          InitialAcademicSchema1793130000000,
          AcademicPeriodsAndAudit1793130100000,
        ],
        migrationsRun: true,
      }),
    }),
    AuthModule,
    AuditModule,
    AcademicPeriodsModule,
    AcademicHistoryModule,
    SubjectsModule,
    CoursesModule,
    EnrollmentsModule,
    GradesModule,
    StudentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
