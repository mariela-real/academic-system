import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialAcademicSchema1793130000000 implements MigrationInterface {
  name = 'InitialAcademicSchema1793130000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "users_role_enum" AS ENUM ('admin', 'teacher', 'student');
      CREATE TYPE "enrollment_status_enum" AS ENUM ('active', 'cancelled');

      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY,
        "email" varchar(255) NOT NULL UNIQUE,
        "full_name" varchar(160) NOT NULL,
        "password_hash" varchar(100) NOT NULL,
        "role" "users_role_enum" NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "subjects" (
        "id" uuid PRIMARY KEY,
        "code" varchar(50) NOT NULL UNIQUE,
        "name" varchar(150) NOT NULL,
        "description" text
      );

      CREATE TABLE "courses" (
        "id" uuid PRIMARY KEY,
        "subject_id" uuid NOT NULL REFERENCES "subjects"("id") ON DELETE RESTRICT,
        "academic_period" varchar(64) NOT NULL,
        "capacity" integer NOT NULL CHECK ("capacity" > 0),
        "instructor_id" uuid REFERENCES "users"("id") ON DELETE RESTRICT,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "students" (
        "id" uuid PRIMARY KEY,
        "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE RESTRICT,
        "student_number" varchar(64) NOT NULL UNIQUE,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE "enrollments" (
        "id" uuid PRIMARY KEY,
        "student_id" uuid NOT NULL REFERENCES "students"("id") ON DELETE RESTRICT,
        "course_id" uuid NOT NULL REFERENCES "courses"("id") ON DELETE RESTRICT,
        "status" "enrollment_status_enum" NOT NULL DEFAULT 'active',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "uq_enrollments_student_course" UNIQUE ("student_id", "course_id")
      );

      CREATE TABLE "grades" (
        "id" uuid PRIMARY KEY,
        "enrollment_id" uuid NOT NULL UNIQUE REFERENCES "enrollments"("id") ON DELETE RESTRICT,
        "value" double precision NOT NULL CHECK ("value" >= 0 AND "value" <= 100),
        "created_by" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "updated_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX "ix_courses_subject_id" ON "courses" ("subject_id");
      CREATE INDEX "ix_enrollments_course_id" ON "enrollments" ("course_id");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "grades";
      DROP TABLE "enrollments";
      DROP TABLE "students";
      DROP TABLE "courses";
      DROP TABLE "subjects";
      DROP TABLE "users";
      DROP TYPE "enrollment_status_enum";
      DROP TYPE "users_role_enum";
    `);
  }
}
