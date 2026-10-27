import { afterEach, describe, expect, it, vi } from 'vitest'
import { createTeacher, getTeachers } from './teachers'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Teacher accounts', () => {
  it('lists only accounts with the teaching role', async () => {
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
              fullName: 'Docente',
              role: 'teacher',
            },
            {
              id: '258a3bcf-796f-4472-a379-fab66fb47b07',
              email: 'student@example.test',
              fullName: 'Estudiante',
              role: 'student',
            },
          ]),
          { status: 200 },
        ),
      ),
    )

    // act
    const teachers = await getTeachers()

    // assert
    expect(teachers.map((teacher) => teacher.email)).toEqual([
      'teacher@example.test',
    ])
  })

  it('creates an account with the teaching role', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          id: '258a3bcf-796f-4472-a379-fab66fb47b06',
          email: 'teacher@example.test',
          fullName: 'Docente',
          role: 'teacher',
        }),
        { status: 201 },
      ),
    )
    vi.stubGlobal('fetch', fetchMock)
    const input = {
      email: 'teacher@example.test',
      fullName: 'Docente',
      password: 'secure-password-123',
    }

    // act
    const teacher = await createTeacher(input)

    // assert
    expect(teacher.role).toBe('teacher')
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/auth/users', 'http://localhost:3000/'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ ...input, role: 'teacher' }),
      }),
    )
  })
})
