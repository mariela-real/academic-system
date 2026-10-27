import { afterEach, describe, expect, it, vi } from 'vitest'
import { getUsers, logout } from './auth'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Institutional accounts', () => {
  it('loads account details without requiring password data', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify([
            {
              id: '258a3bcf-796f-4472-a379-fab66fb47b06',
              email: 'teacher@example.test',
              fullName: 'Docente de Prueba',
              role: 'teacher',
            },
          ]),
          { status: 200 },
        ),
      ),
    )

    // act
    const users = await getUsers()

    // assert
    expect(users).toEqual([
      {
        id: '258a3bcf-796f-4472-a379-fab66fb47b06',
        email: 'teacher@example.test',
        fullName: 'Docente de Prueba',
        role: 'teacher',
      },
    ])
  })

  it('clears the server session through the logout endpoint', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: 'ok' }), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    // act
    await logout()

    // assert
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/auth/logout', 'http://localhost:3000/'),
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    )
  })
})
