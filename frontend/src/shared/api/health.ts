import { getApiUrl } from './api-config'

export type ApiHealth = {
  status: 'ok'
}

export async function getApiHealth(): Promise<ApiHealth> {
  const response = await fetch(getApiUrl('/health'))

  if (!response.ok) {
    throw new Error('La API no está disponible.')
  }

  const body: unknown = await response.json()

  if (typeof body !== 'object' || body === null || !('status' in body) || body.status !== 'ok') {
    throw new Error('La API devolvió una respuesta de salud inválida.')
  }

  return { status: 'ok' }
}
