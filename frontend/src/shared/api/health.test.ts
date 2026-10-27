import { afterEach, describe, expect, it, vi } from 'vitest'
import { getApiHealth } from './health'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('API health status', () => {
  it('reports the API as available when the health endpoint succeeds', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    // act
    const response = await getApiHealth()

    // assert
    expect(response).toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/health', 'http://localhost:3000'),
    )
  })

  it('reports an API failure when the health endpoint rejects the request', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 503 })),
    )

    // act
    const response = getApiHealth()

    // assert
    await expect(response).rejects.toThrow('La API no está disponible.')
  })

  it('reports a configuration error when the API URL is missing', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', '')

    // act
    const response = getApiHealth()

    // assert
    await expect(response).rejects.toThrow('Falta configurar VITE_API_URL.')
  })
})
