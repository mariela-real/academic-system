import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AcademicPeriodsAndAudit1793130100000
  implements MigrationInterface
{
  name = 'AcademicPeriodsAndAudit1793130100000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "academic_periods" (
        "code" varchar(64) PRIMARY KEY,
        "enrollment_starts_at" timestamptz NOT NULL,
        "enrollment_ends_at" timestamptz NOT NULL,
        "enabled" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "ck_academic_period_window"
          CHECK ("enrollment_starts_at" < "enrollment_ends_at")
      );

      CREATE TABLE "academic_audit_logs" (
        "id" uuid PRIMARY KEY,
        "actor_user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE RESTRICT,
        "action" varchar(80) NOT NULL,
        "resource_type" varchar(50) NOT NULL,
        "resource_id" varchar(64) NOT NULL,
        "reason" text,
        "details" jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE INDEX "ix_academic_audit_logs_created_at"
        ON "academic_audit_logs" ("created_at" DESC);
      CREATE INDEX "ix_academic_audit_logs_resource"
        ON "academic_audit_logs" ("resource_type", "resource_id");
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "academic_audit_logs";
      DROP TABLE "academic_periods";
    `);
  }
}
