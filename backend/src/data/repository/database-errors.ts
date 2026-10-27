import { QueryFailedError } from 'typeorm';

type PostgreSqlError = {
  code?: string;
};

function getPostgreSqlError(error: unknown): PostgreSqlError | null {
  if (
    error instanceof QueryFailedError === false ||
    typeof error.driverError !== 'object' ||
    error.driverError === null
  ) {
    return null;
  }

  if (
    'code' in error.driverError === false ||
    typeof error.driverError.code !== 'string'
  ) {
    return null;
  }

  return { code: error.driverError.code };
}

export function isUniqueConstraintViolation(error: unknown): boolean {
  return getPostgreSqlError(error)?.code === '23505';
}

export function isForeignKeyViolation(error: unknown): boolean {
  return getPostgreSqlError(error)?.code === '23503';
}
