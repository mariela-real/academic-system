import { describe, expect, it } from 'vitest'
import { validateSubjectForm } from './subject-form'

describe('Subject registration', () => {
  it('accepts a subject within the catalog field limits', () => {
    // arrange
    const values = {
      code: ' MAT-101 ',
      name: ' Matemática ',
      description: 'Introducción a matemática.',
    }

    // act
    const errors = validateSubjectForm(values)

    // assert
    expect(errors).toEqual({})
  })

  it('rejects blank required fields and values beyond backend limits', () => {
    // arrange
    const values = {
      code: 'A'.repeat(51),
      name: ' ',
      description: 'x'.repeat(2001),
    }

    // act
    const errors = validateSubjectForm(values)

    // assert
    expect(errors).toEqual({
      code: 'El código no puede superar 50 caracteres.',
      name: 'El nombre es obligatorio.',
      description: 'La descripción no puede superar 2000 caracteres.',
    })
  })
})
