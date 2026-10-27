import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  createSubject,
  deleteSubject,
  getSubjects,
  updateSubject,
} from './subjects'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('Subject catalog API', () => {
  it('loads subject records from the authenticated catalog endpoint', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const subject = {
      id: 'b6f77082-d190-4589-b7d6-18976e93b006',
      code: 'MAT-101',
      name: 'Matemática',
      description: null,
    }
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([subject]), { status: 200 }),
    )
    vi.stubGlobal('fetch', fetchMock)

    // act
    const subjects = await getSubjects()

    // assert
    expect(subjects).toEqual([subject])
    expect(fetchMock).toHaveBeenCalledWith(
      new URL('/subjects', 'http://localhost:3000/'),
      expect.objectContaining({ credentials: 'include' }),
    )
  })

  it('creates, updates and deletes subjects using the existing catalog routes', async () => {
    // arrange
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    const subjectId = 'b6f77082-d190-4589-b7d6-18976e93b006'
    const createdSubject = {
      id: subjectId,
      code: 'MAT-101',
      name: 'Matemática',
      description: 'Introducción.',
    }
    const updatedSubject = {
      id: subjectId,
      code: 'MAT-102',
      name: 'Matemática II',
      description: 'Segundo nivel.',
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify(createdSubject), { status: 201 }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(updatedSubject), { status: 200 }),
      )
      .mockResolvedValueOnce(new Response('', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)

    // act
    const created = await createSubject({
      code: createdSubject.code,
      name: createdSubject.name,
      description: createdSubject.description,
    })
    const result = await updateSubject(subjectId, {
      code: updatedSubject.code,
      name: updatedSubject.name,
      description: updatedSubject.description,
    })
    await deleteSubject(subjectId)

    // assert
    expect(created).toEqual(createdSubject)
    expect(result).toEqual(updatedSubject)
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL('/subjects', 'http://localhost:3000/'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(`/subjects/${subjectId}`, 'http://localhost:3000/'),
      expect.objectContaining({ method: 'PATCH' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      new URL(`/subjects/${subjectId}`, 'http://localhost:3000/'),
      expect.objectContaining({ method: 'DELETE' }),
    )
  })
})
