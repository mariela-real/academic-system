import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  ApiError,
  apiRequest,
  getUserFacingErrorMessage,
} from './client'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Academic API client', () => {
  it('sends authenticated requests with cookies and returns JSON', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    // act
    const response = await apiRequest('/auth/me')

    // assert
    expect(response).toEqual({ status: 'ok' })
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/auth/me', 'http://localhost:3000/'),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('preserves the API error status and message', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: 'No autorizado.' }), {
          status: 401,
        }),
      ),
    )

    // act
    const response = apiRequest('/auth/me')

    // assert
    await expect(response).rejects.toMatchObject({
      name: ApiError.name,
      message: 'No autorizado.',
      status: 401,
    })
  })

  it('accepts successful responses without a body', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 200 })),
    )

    // act
    const response = await apiRequest('/subjects/subject-id', {
      method: 'DELETE',
    })

    // assert
    expect(response).toBeNull()
  })

  it('hides internal identifiers from user-facing errors', () => {
    // arrange
    const error = new ApiError(
      'No se encontró el curso 258a3bcf-796f-4472-a379-fab66fb47b06.',
      404,
    )

    // act
    const message = getUserFacingErrorMessage(
      error,
      'No se pudo completar la operación.',
    )

    // assert
    expect(message).toBe('No se pudo completar la operación.')
  })

  it('keeps clear messages returned by the API', () => {
    // arrange
    const error = new ApiError('El correo ya está registrado.', 409)

    // act
    const message = getUserFacingErrorMessage(
      error,
      'No se pudo completar la operación.',
    )

    // assert
    expect(message).toBe('El correo ya está registrado.')
  })
})
