import { getApiUrl } from './api-config'

export class ApiError extends Error {
  readonly status: number

  constructor(
    message: string,
    status: number,
  ) {
    super(message)
    this.name = ApiError.name
    this.status = status
  }
}

const INTERNAL_ID_PATTERN =
  /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/i
const TECHNICAL_ERROR_PATTERN =
  /\b(?:QueryFailedError|SQLSTATE|stack trace|relation does not exist|column .* does not exist)\b/i

export function getUserFacingErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof ApiError === false) {
    return fallback
  }

  const message = error.message.trim()

  if (
    message.length === 0 ||
    INTERNAL_ID_PATTERN.test(message) ||
    TECHNICAL_ERROR_PATTERN.test(message)
  ) {
    return fallback
  }

  return message
}

export async function apiRequest(
  path: string,
  init: RequestInit = {},
): Promise<unknown> {
  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')

  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(getApiUrl(path), {
    ...init,
    credentials: 'include',
    headers,
  })

  const responseBody = await response.text()
  const body: unknown =
    responseBody.length === 0 ? null : JSON.parse(responseBody)

  if (!response.ok) {
    throw new ApiError(getErrorMessage(body), response.status)
  }

  return body
}

function getErrorMessage(body: unknown): string {
  if (
    typeof body !== 'object' ||
    body === null ||
    !('message' in body)
  ) {
    return 'La solicitud no pudo completarse.'
  }

  if (typeof body.message === 'string') {
    return body.message
  }

  if (
    Array.isArray(body.message) &&
    body.message.every((message) => typeof message === 'string')
  ) {
    return body.message.join(', ')
  }

  return 'La solicitud no pudo completarse.'
}

export function expectRecord(value: unknown, resource: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`La API devolvió un ${resource} inválido.`)
  }

  return value as Record<string, unknown>
}

export function expectString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`La API devolvió un campo ${field} inválido.`)
  }

  return value
}

export function expectNumber(value: unknown, field: string): number {
  if (typeof value !== 'number' || Number.isFinite(value) === false) {
    throw new Error(`La API devolvió un campo ${field} inválido.`)
  }

  return value
}

export function expectBoolean(value: unknown, field: string): boolean {
  if (typeof value !== 'boolean') {
    throw new Error(`La API devolvió un campo ${field} inválido.`)
  }

  return value
}

export function expectArray(value: unknown, resource: string): unknown[] {
  if (Array.isArray(value) === false) {
    throw new Error(`La API devolvió una lista de ${resource} inválida.`)
  }

  return value
}
